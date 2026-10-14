from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List

from app.api import deps
from app.core.database import get_db
from app.models.user import User
from app.models.domain import (
    Doctor, Patient, Appointment, MedicalReport,
    DoctorNote, AIPrediction, DiseaseCategory, Prescription
)
from app.schemas.doctor import (
    DoctorDashboardStats,
    DoctorAppointmentResponse,
    DoctorPatientResponse,
    PatientReportResponse,
    ConsultationNoteCreate,
    ConsultationNoteResponse,
    DoctorProfileResponse,
    DoctorProfileUpdate,
    ReportApprovalUpdate,
    PrescriptionCreate,
    PrescriptionResponse,
)

router = APIRouter()

allow_doctor = deps.RoleChecker(["DOCTOR", "ADMIN"])


def _get_doctor_or_404(user: User, db: Session) -> Doctor:
    doctor = db.query(Doctor).filter(Doctor.user_id == user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return doctor


# ─── Dashboard Stats ────────────────────────────────────────────────────────

@router.get("/dashboard", response_model=DoctorDashboardStats)
def get_doctor_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_doctor),
):
    doctor = _get_doctor_or_404(current_user, db)

    today = date.today()
    today_appts = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.appointment_date >= datetime.combine(today, datetime.min.time()),
        Appointment.appointment_date < datetime.combine(today, datetime.max.time()),
    ).count()

    patient_ids = db.query(Appointment.patient_id).filter(
        Appointment.doctor_id == doctor.id
    ).distinct().all()
    total_patients = len(patient_ids)

    pending_reports = db.query(MedicalReport).filter(
        MedicalReport.doctor_id == doctor.id,
        MedicalReport.approved == False,
    ).count()

    total_consultations = db.query(DoctorNote).filter(
        DoctorNote.doctor_id == doctor.id
    ).count()

    return DoctorDashboardStats(
        today_appointments=today_appts,
        total_patients=total_patients,
        pending_reports=pending_reports,
        total_consultations=total_consultations,
    )


# ─── Appointments ────────────────────────────────────────────────────────────

@router.get("/appointments", response_model=List[DoctorAppointmentResponse])
def get_doctor_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_doctor),
):
    doctor = _get_doctor_or_404(current_user, db)

    appointments = (
        db.query(Appointment)
        .filter(Appointment.doctor_id == doctor.id)
        .order_by(Appointment.appointment_date.asc())
        .all()
    )

    result = []
    now = datetime.utcnow()
    for appt in appointments:
        patient = db.query(Patient).filter(Patient.id == appt.patient_id).first()
        patient_user = db.query(User).filter(User.id == patient.user_id).first() if patient else None
        result.append(DoctorAppointmentResponse(
            id=appt.id,
            patient_name=patient_user.full_name if patient_user else "Unknown",
            patient_email=patient_user.email if patient_user else "",
            appointment_date=appt.appointment_date,
            notes=appt.notes,
            status="upcoming" if appt.appointment_date > now else "past",
        ))
    return result


# ─── Patients ────────────────────────────────────────────────────────────────

@router.get("/patients", response_model=List[DoctorPatientResponse])
def get_doctor_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_doctor),
):
    doctor = _get_doctor_or_404(current_user, db)

    patient_ids = (
        db.query(Appointment.patient_id)
        .filter(Appointment.doctor_id == doctor.id)
        .distinct()
        .all()
    )
    patient_ids = [p[0] for p in patient_ids]

    result = []
    for pid in patient_ids:
        patient = db.query(Patient).filter(Patient.id == pid).first()
        if not patient:
            continue
        patient_user = db.query(User).filter(User.id == patient.user_id).first()
        last_appt = (
            db.query(Appointment)
            .filter(Appointment.doctor_id == doctor.id, Appointment.patient_id == pid)
            .order_by(Appointment.appointment_date.desc())
            .first()
        )
        result.append(DoctorPatientResponse(
            patient_id=patient.id,
            user_id=patient.user_id,
            full_name=patient_user.full_name if patient_user else "Unknown",
            email=patient_user.email if patient_user else "",
            gender=patient.gender,
            blood_group=patient.blood_group,
            last_appointment=last_appt.appointment_date if last_appt else None,
        ))
    return result


# ─── Patient Reports ─────────────────────────────────────────────────────────

@router.get("/patients/{patient_id}/reports", response_model=List[PatientReportResponse])
def get_patient_reports(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_doctor),
):
    reports = (
        db.query(MedicalReport)
        .filter(MedicalReport.patient_id == patient_id)
        .order_by(MedicalReport.created_at.desc())
        .all()
    )

    result = []
    for r in reports:
        prediction = db.query(AIPrediction).filter(AIPrediction.id == r.prediction_id).first() if r.prediction_id else None
        result.append(PatientReportResponse(
            id=r.id,
            result_class=prediction.result_class if prediction else "N/A",
            confidence_score=prediction.confidence_score if prediction else 0.0,
            disease="Unknown",
            created_at=r.created_at,
            clinical_notes=r.clinical_notes,
            approved=r.approved,
        ))
    return result


# ─── Consultation Notes ──────────────────────────────────────────────────────

@router.get("/consultations", response_model=List[ConsultationNoteResponse])
def get_consultations(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_doctor),
):
    doctor = _get_doctor_or_404(current_user, db)

    notes = (
        db.query(DoctorNote)
        .filter(DoctorNote.doctor_id == doctor.id)
        .order_by(DoctorNote.created_at.desc())
        .all()
    )

    result = []
    for note in notes:
        patient = db.query(Patient).filter(Patient.id == note.patient_id).first()
        patient_user = db.query(User).filter(User.id == patient.user_id).first() if patient else None
        result.append(ConsultationNoteResponse(
            id=note.id,
            patient_id=note.patient_id,
            patient_name=patient_user.full_name if patient_user else "Unknown",
            note_text=note.note_text,
            created_at=note.created_at,
        ))
    return result


@router.post("/notes", response_model=ConsultationNoteResponse)
def add_consultation_note(
    note_in: ConsultationNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_doctor),
):
    doctor = _get_doctor_or_404(current_user, db)

    patient = db.query(Patient).filter(Patient.id == note_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    note = DoctorNote(
        doctor_id=doctor.id,
        patient_id=note_in.patient_id,
        note_text=note_in.note_text,
    )
    db.add(note)
    db.commit()
    db.refresh(note)

    patient_user = db.query(User).filter(User.id == patient.user_id).first()
    return ConsultationNoteResponse(
        id=note.id,
        patient_id=note.patient_id,
        patient_name=patient_user.full_name if patient_user else "Unknown",
        note_text=note.note_text,
        created_at=note.created_at,
    )


# ─── Doctor Profile ──────────────────────────────────────────────────────────

@router.get("/profile", response_model=DoctorProfileResponse)
def get_doctor_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_doctor),
):
    doctor = _get_doctor_or_404(current_user, db)
    return DoctorProfileResponse(
        id=doctor.id,
        user_id=current_user.id,
        full_name=current_user.full_name or "",
        email=current_user.email,
        specialization=doctor.specialization,
        license_number=doctor.license_number,
        experience_years=doctor.experience_years or 0,
        bio=doctor.bio,
        created_at=doctor.created_at,
    )


@router.put("/profile", response_model=DoctorProfileResponse)
def update_doctor_profile(
    update_in: DoctorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_doctor),
):
    doctor = _get_doctor_or_404(current_user, db)

    if update_in.full_name is not None:
        current_user.full_name = update_in.full_name
        db.add(current_user)

    if update_in.specialization is not None:
        doctor.specialization = update_in.specialization
    if update_in.license_number is not None:
        doctor.license_number = update_in.license_number
    if update_in.experience_years is not None:
        doctor.experience_years = update_in.experience_years
    if update_in.bio is not None:
        doctor.bio = update_in.bio

    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    db.refresh(current_user)

    return DoctorProfileResponse(
        id=doctor.id,
        user_id=current_user.id,
        full_name=current_user.full_name or "",
        email=current_user.email,
        specialization=doctor.specialization,
        license_number=doctor.license_number,
        experience_years=doctor.experience_years or 0,
        bio=doctor.bio,
        created_at=doctor.created_at,
    )


# ─── Report Approval / Clinical Notes ────────────────────────────────────────

@router.post("/reports/{report_id}/approve", response_model=PatientReportResponse)
def update_report_approval(
    report_id: str,
    update_in: ReportApprovalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_doctor),
):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Medical report not found")

    report.approved = update_in.approved
    if update_in.clinical_notes is not None:
        report.clinical_notes = update_in.clinical_notes
    db.commit()
    db.refresh(report)

    prediction = db.query(AIPrediction).filter(AIPrediction.id == report.prediction_id).first() if report.prediction_id else None
    return PatientReportResponse(
        id=report.id,
        result_class=prediction.result_class if prediction else "N/A",
        confidence_score=prediction.confidence_score if prediction else 0.0,
        disease="Unknown",
        created_at=report.created_at,
        clinical_notes=report.clinical_notes,
        approved=report.approved,
    )


# ─── Prescriptions ───────────────────────────────────────────────────────────

@router.get("/prescriptions", response_model=List[PrescriptionResponse])
def get_doctor_prescriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_doctor),
):
    doctor = _get_doctor_or_404(current_user, db)
    prescriptions = (
        db.query(Prescription)
        .filter(Prescription.doctor_id == doctor.id)
        .order_by(Prescription.created_at.desc())
        .all()
    )

    result = []
    for pr in prescriptions:
        patient = db.query(Patient).filter(Patient.id == pr.patient_id).first()
        patient_user = db.query(User).filter(User.id == patient.user_id).first() if patient else None
        result.append(PrescriptionResponse(
            id=pr.id,
            doctor_id=pr.doctor_id,
            patient_id=pr.patient_id,
            patient_name=patient_user.full_name if patient_user else "Unknown",
            medication=pr.medication,
            dosage=pr.dosage,
            instructions=pr.instructions,
            created_at=pr.created_at,
        ))
    return result


@router.post("/prescriptions", response_model=PrescriptionResponse)
def create_prescription(
    pres_in: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_doctor),
):
    doctor = _get_doctor_or_404(current_user, db)
    patient = db.query(Patient).filter(Patient.id == pres_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    new_pres = Prescription(
        doctor_id=doctor.id,
        patient_id=pres_in.patient_id,
        medication=pres_in.medication,
        dosage=pres_in.dosage,
        instructions=pres_in.instructions,
    )
    db.add(new_pres)
    db.commit()
    db.refresh(new_pres)

    patient_user = db.query(User).filter(User.id == patient.user_id).first()
    return PrescriptionResponse(
        id=new_pres.id,
        doctor_id=new_pres.doctor_id,
        patient_id=new_pres.patient_id,
        patient_name=patient_user.full_name if patient_user else "Unknown",
        medication=new_pres.medication,
        dosage=new_pres.dosage,
        instructions=new_pres.instructions,
        created_at=new_pres.created_at,
    )