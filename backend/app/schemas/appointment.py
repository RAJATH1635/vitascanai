from datetime import date, time, datetime
from pydantic import BaseModel


class AppointmentCreate(BaseModel):
    doctor_name: str
    appointment_date: date
    appointment_time: time
    symptoms: str


class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    doctor_name: str
    appointment_date: date
    appointment_time: time
    symptoms: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True