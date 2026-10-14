from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.core.database import get_db
from app.models.user import User

from app.schemas.patient_appointment import (
    PatientAppointmentCreate,
    PatientAppointmentResponse,
)

from app.services.patient_appointment_service import (
    PatientAppointmentService,
)

router = APIRouter()


@router.post(
    "/",
    response_model=PatientAppointmentResponse,
)
def create_appointment(
    appointment: PatientAppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    return PatientAppointmentService.create(
        db,
        current_user.id,
        appointment,
    )


@router.get(
    "/",
    response_model=List[PatientAppointmentResponse],
)
def get_my_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    return PatientAppointmentService.get_user_appointments(
        db,
        current_user.id,
    )