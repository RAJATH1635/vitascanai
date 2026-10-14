import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Date,
    Time,
    DateTime,
    ForeignKey,
    Text,
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class PatientAppointment(Base):
    __tablename__ = "patient_appointments"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    user_id = Column(
        String,
        ForeignKey("users.id"),
        nullable=False,
    )

    disease = Column(
        String,
        nullable=False,
    )

    doctor = Column(
        String,
        nullable=False,
    )

    appointment_date = Column(
        Date,
        nullable=False,
    )

    appointment_time = Column(
        Time,
        nullable=False,
    )

    notes = Column(Text)

    status = Column(
        String,
        default="Pending",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    user = relationship("User")