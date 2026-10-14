
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

class AuditableBase:
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    status = Column(String, default="ACTIVE")

class Patient(Base, AuditableBase):
    __tablename__ = "patients"
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    date_of_birth = Column(DateTime, nullable=True)
    gender = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    medical_history = Column(Text, nullable=True)
    user = relationship("User")

class Doctor(Base, AuditableBase):
    __tablename__ = "doctors"
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    specialization = Column(String, nullable=False)
    license_number = Column(String, nullable=False, unique=True)
    experience_years = Column(Float, default=0)
    bio = Column(Text, nullable=True)
    user = relationship("User")

class DiseaseCategory(Base, AuditableBase):
    __tablename__ = "disease_categories"
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=True)

class AIModel(Base, AuditableBase):
    __tablename__ = "ai_models"
    disease_category_id = Column(String, ForeignKey("disease_categories.id"), nullable=False)
    version = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    accuracy = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)

class ClinicalData(Base, AuditableBase):
    __tablename__ = "clinical_data"
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    disease_category_id = Column(String, ForeignKey("disease_categories.id"), nullable=False)
    data_json = Column(JSON, nullable=False)

class MedicalImage(Base, AuditableBase):
    __tablename__ = "medical_images"
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    disease_category_id = Column(String, ForeignKey("disease_categories.id"), nullable=False)
    file_url = Column(String, nullable=False)
    metadata_json = Column(JSON, nullable=True)

class AIPrediction(Base, AuditableBase):
    __tablename__ = "ai_predictions"
    image_id = Column(String, ForeignKey("medical_images.id"), nullable=True)
    clinical_data_id = Column(String, ForeignKey("clinical_data.id"), nullable=True)
    model_id = Column(String, ForeignKey("ai_models.id"), nullable=False)
    result_class = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)

class ExplainableAIResult(Base, AuditableBase):
    __tablename__ = "explainable_ai_results"
    prediction_id = Column(String, ForeignKey("ai_predictions.id"), unique=True, nullable=False)
    heatmap_url = Column(String, nullable=True)
    shap_data_json = Column(JSON, nullable=True)

class MedicalReport(Base, AuditableBase):
    __tablename__ = "medical_reports"
    prediction_id = Column(String, ForeignKey("ai_predictions.id"), nullable=True)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(String, ForeignKey("doctors.id"), nullable=True)
    report_url = Column(String, nullable=True)
    clinical_notes = Column(Text, nullable=True)
    approved = Column(Boolean, default=False)

class Appointment(Base, AuditableBase):
    __tablename__ = "appointments"
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(String, ForeignKey("doctors.id"), nullable=False)
    appointment_date = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)

class DoctorNote(Base, AuditableBase):
    __tablename__ = "doctor_notes"
    doctor_id = Column(String, ForeignKey("doctors.id"), nullable=False)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    note_text = Column(Text, nullable=False)

class Prescription(Base, AuditableBase):
    __tablename__ = "prescriptions"
    doctor_id = Column(String, ForeignKey("doctors.id"), nullable=False)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    medication = Column(String, nullable=False)
    dosage = Column(String, nullable=False)
    instructions = Column(Text, nullable=True)

class Notification(Base, AuditableBase):
    __tablename__ = "notifications"
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)

class ActivityLog(Base, AuditableBase):
    __tablename__ = "activity_logs"
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    entity = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)

class AuditLog(Base, AuditableBase):
    __tablename__ = "audit_logs"
    table_name = Column(String, nullable=False)
    record_id = Column(String, nullable=False)
    action = Column(String, nullable=False)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    changed_by = Column(String, ForeignKey("users.id"), nullable=True)
