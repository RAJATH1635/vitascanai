import uuid
from datetime import datetime, timedelta
from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.domain import (
    Patient,
    Doctor,
    DiseaseCategory,
    AIModel,
    AIPrediction,
    MedicalReport,
    Appointment,
    DoctorNote,
    Prescription,
)
from app.core.security import get_password_hash

# Ensure all tables exist
Base.metadata.create_all(bind=engine)

def seed_users():
    db = SessionLocal()

    # ── 1. Patient: RAJATH B G ──────────────────────────────────────────
    patient_email = "rajathbg123@gmail.com"
    patient_user = db.query(User).filter_by(email=patient_email).first()
    if not patient_user:
        patient_user = User(
            id=str(uuid.uuid4()),
            email=patient_email,
            hashed_password=get_password_hash("123456789"),
            role="PATIENT",
            full_name="RAJATH B G",
            is_active=True,
            is_verified=True,
        )
        db.add(patient_user)
        db.commit()
        db.refresh(patient_user)
        print(f"[OK] Patient user created: {patient_email}")

    patient_profile = db.query(Patient).filter_by(user_id=patient_user.id).first()
    if not patient_profile:
        patient_profile = Patient(
            id=str(uuid.uuid4()),
            user_id=patient_user.id,
            gender="Male",
            blood_group="O+",
            medical_history="Mild fatigue, family history of hypertension.",
        )
        db.add(patient_profile)
        db.commit()
        db.refresh(patient_profile)
        print("[OK] Patient profile created")

    # ── 2. Doctor: Dr. Ramesh ──────────────────────────────────────────
    doctor_email = "ramesh123@gmail.com"
    doctor_user = db.query(User).filter_by(email=doctor_email).first()
    if not doctor_user:
        doctor_user = User(
            id=str(uuid.uuid4()),
            email=doctor_email,
            hashed_password=get_password_hash("123456789"),
            role="DOCTOR",
            full_name="Dr. Ramesh",
            is_active=True,
            is_verified=True,
        )
        db.add(doctor_user)
        db.commit()
        db.refresh(doctor_user)
        print(f"[OK] Doctor user created: {doctor_email}")

    doctor_profile = db.query(Doctor).filter_by(user_id=doctor_user.id).first()
    if not doctor_profile:
        doctor_profile = Doctor(
            id=str(uuid.uuid4()),
            user_id=doctor_user.id,
            specialization="General Medicine",
            license_number="LIC-RAMESH-001",
            experience_years=10.0,
            bio="Senior Consultant in General Medicine with special interest in preventive diagnostics.",
        )
        db.add(doctor_profile)
        db.commit()
        db.refresh(doctor_profile)
        print("[OK] Doctor profile created")

    # ── 3. Disease Categories & AI Model ───────────────────────────────
    categories = [
        {"name": "Dementia", "description": "Alzheimer's and Dementia MRI detection"},
        {"name": "Breast Cancer", "description": "Breast Cancer Histopathology"},
        {"name": "Malaria", "description": "Malaria Blood Smear"},
        {"name": "Anemia", "description": "Anemia via Tabular CBC Data"},
    ]
    for cat in categories:
        if not db.query(DiseaseCategory).filter_by(name=cat["name"]).first():
            db.add(DiseaseCategory(id=str(uuid.uuid4()), **cat))
    db.commit()

    cat_dementia = db.query(DiseaseCategory).filter_by(name="Dementia").first()
    model = db.query(AIModel).filter_by(disease_category_id=cat_dementia.id).first()
    if not model:
        model = AIModel(
            id=str(uuid.uuid4()),
            disease_category_id=cat_dementia.id,
            version="1.0.0",
            name="Dementia-ResNet50",
            description="Deep learning classifier for MRI axial brain slices",
            accuracy=0.94,
            is_active=True,
        )
        db.add(model)
        db.commit()
        db.refresh(model)

    # ── 4. AI Prediction & Medical Report ─────────────────────────────
    prediction = db.query(AIPrediction).first()
    if not prediction:
        prediction = AIPrediction(
            id=str(uuid.uuid4()),
            model_id=model.id,
            result_class="Mild Dementia",
            confidence_score=0.91,
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)

    report = db.query(MedicalReport).filter_by(patient_id=patient_profile.id).first()
    if not report:
        report = MedicalReport(
            id=str(uuid.uuid4()),
            prediction_id=prediction.id,
            patient_id=patient_profile.id,
            doctor_id=doctor_profile.id,
            clinical_notes="Brain scan shows hippocampal volume shrinkage consistent with early stage mild cognitive changes. Advised cognitive therapy.",
            approved=False,
        )
        db.add(report)
        db.commit()
        print("[OK] Medical Report created")

    # ── 5. Appointments ───────────────────────────────────────────────
    now = datetime.utcnow()
    # Upcoming appointment (in 2 days)
    upcoming_appt = db.query(Appointment).filter(
        Appointment.patient_id == patient_profile.id,
        Appointment.doctor_id == doctor_profile.id,
        Appointment.appointment_date > now,
    ).first()
    if not upcoming_appt:
        db.add(Appointment(
            id=str(uuid.uuid4()),
            patient_id=patient_profile.id,
            doctor_id=doctor_profile.id,
            appointment_date=now + timedelta(days=2, hours=3),
            notes="Follow-up review on brain MRI scan and baseline cognitive evaluation.",
        ))
        db.commit()
        print("[OK] Upcoming appointment created")

    # Past appointment (3 days ago)
    past_appt = db.query(Appointment).filter(
        Appointment.patient_id == patient_profile.id,
        Appointment.doctor_id == doctor_profile.id,
        Appointment.appointment_date < now,
    ).first()
    if not past_appt:
        db.add(Appointment(
            id=str(uuid.uuid4()),
            patient_id=patient_profile.id,
            doctor_id=doctor_profile.id,
            appointment_date=now - timedelta(days=3, hours=2),
            notes="Initial screening consultation and blood work recommendation.",
        ))
        db.commit()
        print("[OK] Past appointment created")

    # ── 6. Doctor Consultation Note ───────────────────────────────────
    note = db.query(DoctorNote).filter_by(patient_id=patient_profile.id, doctor_id=doctor_profile.id).first()
    if not note:
        db.add(DoctorNote(
            id=str(uuid.uuid4()),
            patient_id=patient_profile.id,
            doctor_id=doctor_profile.id,
            note_text="Initial evaluation completed. Patient reports occasional memory lapses over past 4 months. Blood pressure stable (124/80). Scheduled for diagnostic MRI scan.",
        ))
        db.commit()
        print("[OK] Doctor consultation note created")

    # ── 7. Prescription ───────────────────────────────────────────────
    pres = db.query(Prescription).filter_by(patient_id=patient_profile.id, doctor_id=doctor_profile.id).first()
    if not pres:
        db.add(Prescription(
            id=str(uuid.uuid4()),
            patient_id=patient_profile.id,
            doctor_id=doctor_profile.id,
            medication="Donepezil Hydrochloride",
            dosage="5mg oral tablet, once daily at bedtime",
            instructions="Take after light meal with a glass of water. Report any persistent nausea or dizziness immediately.",
        ))
        db.commit()
        print("[OK] Prescription created")

    db.close()
    print("\nDatabase seeded successfully!")
    print("Test Accounts:")
    print("  Patient : rajathbg123@gmail.com / 123456789 (RAJATH B G)")
    print("  Doctor  : ramesh123@gmail.com   / 123456789 (Dr. Ramesh)")

if __name__ == "__main__":
    seed_users()
