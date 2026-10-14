from sqlalchemy.orm import Session

from app.models.domain import Appointment


class AppointmentService:

    @staticmethod
    def create(
        db: Session,
        patient_id: str,
        doctor_name: str,
        appointment_date,
        appointment_time,
        symptoms: str
    ):

        appointment = Appointment(
            patient_id=patient_id,
            doctor_name=doctor_name,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            symptoms=symptoms,
            status="Pending",
        )

        db.add(appointment)
        db.commit()
        db.refresh(appointment)

        return appointment

    @staticmethod
    def get_all(db: Session):
        return (
            db.query(Appointment)
            .order_by(Appointment.created_at.desc())
            .all()
        )

    @staticmethod
    def get_by_id(db: Session, appointment_id: str):
        return (
            db.query(Appointment)
            .filter(Appointment.id == appointment_id)
            .first()
        )

    @staticmethod
    def update_status(
        db: Session,
        appointment_id: str,
        status: str,
    ):
        appointment = (
            db.query(Appointment)
            .filter(Appointment.id == appointment_id)
            .first()
        )

        if appointment:
            appointment.status = status
            db.commit()
            db.refresh(appointment)

        return appointment

    @staticmethod
    def delete(db: Session, appointment_id: str):

        appointment = (
            db.query(Appointment)
            .filter(Appointment.id == appointment_id)
            .first()
        )

        if appointment:
            db.delete(appointment)
            db.commit()

        return appointment