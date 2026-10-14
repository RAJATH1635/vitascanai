from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.api import deps
from app.models.user import User
from app.models.domain import Patient, Doctor, Appointment, MedicalReport, AIPrediction, DoctorNote
from app.models.prediction import Prediction

router = APIRouter()


class SearchResultItem(BaseModel):
    id: str
    type: str  # "patient", "appointment", "report", "action"
    title: str
    subtitle: Optional[str] = None
    url: str
    badge: Optional[str] = None


class SearchResponse(BaseModel):
    query: str
    total: int
    results: List[SearchResultItem]


@router.get("", response_model=SearchResponse)
def global_search(
    q: str = Query(..., min_length=1, description="Search query string"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    query_str = q.strip().lower()
    results: List[SearchResultItem] = []

    # ── 1. DOCTOR ROLE SEARCH ─────────────────────────────────────────
    if current_user.role in ["DOCTOR", "ADMIN"]:
        doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()

        # A. Quick action shortcuts
        doctor_actions = [
            ("Appointments", "View all scheduled patient consultations", "/doctor/appointments", ["appointment", "schedule", "calendar", "visit"]),
            ("My Patients", "Patient directory and health records", "/doctor/patients", ["patient", "client", "person", "directory"]),
            ("Diagnostic Reports", "Review AI scan predictions and sign off", "/doctor/reports", ["report", "scan", "diagnosis", "mri", "cancer", "dementia", "ai"]),
            ("Consultation Notes", "Record and view clinical observations", "/doctor/notes", ["note", "clinical", "consultation", "remark", "observation"]),
            ("Prescriptions", "Issue and review patient medication regimens", "/doctor/prescriptions", ["prescription", "rx", "medicine", "drug", "medication", "dosage"]),
            ("Doctor Profile", "Manage your medical credentials and license", "/doctor/profile", ["profile", "account", "license", "specialty"]),
        ]
        for title, desc, url, tags in doctor_actions:
            if any(query_str in tag or query_str in title.lower() for tag in tags):
                results.append(SearchResultItem(
                    id=f"action-{title}",
                    type="action",
                    title=title,
                    subtitle=desc,
                    url=url,
                    badge="Quick Action"
                ))

        # B. Search Patients
        matching_users = (
            db.query(User)
            .filter(
                User.role == "PATIENT",
                or_(
                    User.full_name.ilike(f"%{query_str}%"),
                    User.email.ilike(f"%{query_str}%"),
                )
            )
            .limit(5)
            .all()
        )
        for u in matching_users:
            patient_profile = db.query(Patient).filter(Patient.user_id == u.id).first()
            pid = patient_profile.id if patient_profile else u.id
            results.append(SearchResultItem(
                id=f"patient-{u.id}",
                type="patient",
                title=u.full_name or "Unknown Patient",
                subtitle=f"{u.email} • Blood: {patient_profile.blood_group if patient_profile else 'N/A'}",
                url=f"/doctor/reports?patient_id={pid}",
                badge="Patient"
            ))

        # C. Search Appointments
        if doctor:
            doctor_appts = (
                db.query(Appointment)
                .filter(Appointment.doctor_id == doctor.id)
                .all()
            )
            for appt in doctor_appts:
                patient = db.query(Patient).filter(Patient.id == appt.patient_id).first()
                patient_user = db.query(User).filter(User.id == patient.user_id).first() if patient else None
                pat_name = patient_user.full_name if patient_user else "Patient"
                notes_text = appt.notes or ""

                if query_str in pat_name.lower() or query_str in notes_text.lower() or "appointment" in query_str:
                    results.append(SearchResultItem(
                        id=f"appt-{appt.id}",
                        type="appointment",
                        title=f"Appointment: {pat_name}",
                        subtitle=f"{appt.appointment_date.strftime('%d %b %Y, %I:%M %p')} • {notes_text[:40]}",
                        url="/doctor/appointments",
                        badge="Appointment"
                    ))

        # D. Search AI Reports
        reports = (
            db.query(MedicalReport)
            .filter(MedicalReport.doctor_id == doctor.id) if doctor else []
        )
        for rep in reports:
            prediction = db.query(AIPrediction).filter(AIPrediction.id == rep.prediction_id).first() if rep.prediction_id else None
            pred_class = prediction.result_class if prediction else "Medical Report"
            notes = rep.clinical_notes or ""
            if query_str in pred_class.lower() or query_str in notes.lower() or "report" in query_str:
                results.append(SearchResultItem(
                    id=f"rep-{rep.id}",
                    type="report",
                    title=f"AI Scan: {pred_class}",
                    subtitle=f"{rep.created_at.strftime('%d %b %Y')} • {'Approved' if rep.approved else 'Pending Review'}",
                    url=f"/doctor/reports?patient_id={rep.patient_id}",
                    badge="Report"
                ))

    # ── 2. PATIENT ROLE SEARCH ────────────────────────────────────────
    else:
        # A. Quick action shortcuts
        patient_actions = [
            ("Start New Scan", "Upload medical images for AI screening", "/dashboard/new-scan", ["new", "scan", "upload", "mri", "test", "screen"]),
            ("Medical Reports", "View your previous AI scan reports", "/dashboard/reports", ["report", "result", "history", "diagnosis"]),
            ("My Appointments", "View and schedule consultations", "/dashboard/appointments", ["appointment", "doctor", "booking", "visit"]),
            ("Patient Profile", "View your personal and medical info", "/dashboard/profile", ["profile", "account", "settings"]),
        ]
        for title, desc, url, tags in patient_actions:
            if any(query_str in tag or query_str in title.lower() for tag in tags):
                results.append(SearchResultItem(
                    id=f"action-{title}",
                    type="action",
                    title=title,
                    subtitle=desc,
                    url=url,
                    badge="Quick Action"
                ))

        # B. Search Patient's Own Predictions
        user_preds = (
            db.query(Prediction)
            .filter(
                Prediction.user_id == current_user.id,
                or_(
                    Prediction.disease.ilike(f"%{query_str}%"),
                    Prediction.prediction.ilike(f"%{query_str}%"),
                )
            )
            .limit(6)
            .all()
        )
        for pred in user_preds:
            conf = pred.confidence * 100 if pred.confidence <= 1 else pred.confidence
            results.append(SearchResultItem(
                id=f"pred-{pred.id}",
                type="report",
                title=f"{pred.disease} Scan",
                subtitle=f"Result: {pred.prediction} ({conf:.0f}% confidence)",
                url=f"/dashboard/reports/{pred.id}",
                badge="Scan Result"
            ))

    return SearchResponse(
        query=q,
        total=len(results),
        results=results[:10]  # Return top 10 relevant matches
    )
