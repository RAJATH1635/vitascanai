from datetime import date, time, datetime
from pydantic import BaseModel


class PatientAppointmentCreate(BaseModel):
    disease: str
    doctor: str
    appointment_date: date
    appointment_time: time
    notes: str | None = None


class PatientAppointmentResponse(BaseModel):
    id: str
    disease: str
    doctor: str
    appointment_date: date
    appointment_time: time
    notes: str | None = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True