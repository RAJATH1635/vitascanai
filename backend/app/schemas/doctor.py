from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DoctorCreate(BaseModel):
    specialization: str
    license_number: str
    experience_years: float = 0


class DoctorRegister(BaseModel):
    email: str
    password: str
    full_name: str
    specialization: str
    license_number: str
    experience_years: float = 0


class DoctorDashboardStats(BaseModel):
    today_appointments: int
    total_patients: int
    pending_reports: int
    total_consultations: int


class DoctorAppointmentResponse(BaseModel):
    id: str
    patient_name: str
    patient_email: str
    appointment_date: datetime
    notes: Optional[str]
    status: str  # upcoming / past

    class Config:
        from_attributes = True


class DoctorPatientResponse(BaseModel):
    patient_id: str
    user_id: str
    full_name: str
    email: str
    gender: Optional[str]
    blood_group: Optional[str]
    last_appointment: Optional[datetime]

    class Config:
        from_attributes = True


class PatientReportResponse(BaseModel):
    id: str
    result_class: str
    confidence_score: float
    disease: str
    created_at: datetime
    clinical_notes: Optional[str]
    approved: bool

    class Config:
        from_attributes = True


class ConsultationNoteCreate(BaseModel):
    patient_id: str
    note_text: str


class ConsultationNoteResponse(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    note_text: str
    created_at: datetime

    class Config:
        from_attributes = True


class DoctorProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    specialization: str
    license_number: str
    experience_years: float
    bio: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DoctorProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    experience_years: Optional[float] = None
    bio: Optional[str] = None


class ReportApprovalUpdate(BaseModel):
    approved: bool
    clinical_notes: Optional[str] = None


class PrescriptionCreate(BaseModel):
    patient_id: str
    medication: str
    dosage: str
    instructions: Optional[str] = None


class PrescriptionResponse(BaseModel):
    id: str
    doctor_id: str
    patient_id: str
    patient_name: str
    medication: str
    dosage: str
    instructions: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

