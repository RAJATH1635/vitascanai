import uuid
from app.core.database import SessionLocal
from app.models.user import User
from app.models.domain import Patient, Doctor, DiseaseCategory, Appointment, MedicalImage, AIPrediction, MedicalReport
from app.core.security import get_password_hash
from datetime import datetime, timedelta

def seed_db():
    db = SessionLocal()
    
    print("Seeding Users...")
    # Admin
    admin_id = str(uuid.uuid4())
    admin_user = User(id=admin_id, email="admin@vitascan.ai", hashed_password=get_password_hash("Admin123!"), role="ADMIN", full_name="System Admin")
    
    # Doctor
    doctor_id = str(uuid.uuid4())
    doc_user = User(id=doctor_id, email="doctor@vitascan.ai", hashed_password=get_password_hash("Doctor123!"), role="DOCTOR", full_name="Dr. Jane Smith")
    
    # Patient
    patient_id = str(uuid.uuid4())
    pat_user = User(id=patient_id, email="patient@vitascan.ai", hashed_password=get_password_hash("Patient123!"), role="PATIENT", full_name="John Doe")
    
    for u in [admin_user, doc_user, pat_user]:
        if not db.query(User).filter_by(email=u.email).first():
            db.add(u)
    db.commit()
    
    print("Seeding Doctor Profile...")
    doc_db = db.query(User).filter_by(email="doctor@vitascan.ai").first()
    if not db.query(Doctor).filter_by(user_id=doc_db.id).first():
        doc = Doctor(user_id=doc_db.id, specialization="Neurology", license_number="LIC-12345", experience_years=10, bio="Expert in brain scans")
        db.add(doc)
    
    print("Seeding Patient Profile...")
    pat_db = db.query(User).filter_by(email="patient@vitascan.ai").first()
    if not db.query(Patient).filter_by(user_id=pat_db.id).first():
        pat = Patient(user_id=pat_db.id, date_of_birth=datetime(1980, 1, 1), gender="Male", blood_group="O+", medical_history="None")
        db.add(pat)
    db.commit()

    print("Seeding Disease Categories...")
    categories = [
        {"name": "Dementia", "description": "Alzheimer's and Dementia MRI detection"},
        {"name": "Breast Cancer", "description": "Breast Cancer Histopathology"},
        {"name": "Malaria", "description": "Malaria Blood Smear"},
        {"name": "Anemia", "description": "Anemia via Tabular CBC Data"}
    ]
    
    for cat in categories:
        if not db.query(DiseaseCategory).filter_by(name=cat["name"]).first():
            db.add(DiseaseCategory(**cat))
    db.commit()

    print("Seeding Appointments and Reports...")
    p = db.query(Patient).first()
    d = db.query(Doctor).first()
    c = db.query(DiseaseCategory).first()
    
    if p and d:
        if not db.query(Appointment).filter_by(patient_id=p.id).first():
            app = Appointment(patient_id=p.id, doctor_id=d.id, appointment_date=datetime.utcnow() + timedelta(days=2), notes="Follow up scan review")
            db.add(app)
        db.commit()
        
    print("Seed complete!")

if __name__ == "__main__":
    seed_db()
