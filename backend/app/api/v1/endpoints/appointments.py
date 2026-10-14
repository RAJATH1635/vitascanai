from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.core.database import get_db

from app.models.user import User

from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse,
)

from app.services.appointment_service import AppointmentService

router = APIRouter()


@router.post(
    "/appointments",
    response_model=AppointmentResponse,
)
def create_appointment(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):

    return AppointmentService.create(
        db=db,
        patient_id=current_user.id,
        doctor_name=appointment.doctor_name,
        appointment_date=appointment.appointment_date,
        appointment_time=appointment.appointment_time,
        symptoms=appointment.symptoms,
    )


@router.get(
    "/appointments",
    response_model=List[AppointmentResponse],
)
def get_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):

    return AppointmentService.get_all(db)


@router.get(
    "/appointments/{appointment_id}",
    response_model=AppointmentResponse,
)
def get_appointment(
    appointment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):

    appointment = AppointmentService.get_by_id(
        db,
        appointment_id,
    )

    if appointment is None:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found",
        )

    return appointment