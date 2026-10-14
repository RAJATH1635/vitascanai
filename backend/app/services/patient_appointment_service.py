from sqlalchemy.orm import Session

from app.models.patient_appointment import PatientAppointment


class PatientAppointmentService:

    @staticmethod
    def create(db: Session, user_id: str, data):
        appointment = PatientAppointment(
            user_id=user_id,
            disease=data.disease,
            doctor=data.doctor,
            appointment_date=data.appointment_date,
            appointment_time=data.appointment_time,
            notes=data.notes,
        )

        db.add(appointment)
        db.commit()
        db.refresh(appointment)

        return appointment

    @staticmethod
    def get_user_appointments(db: Session, user_id: str):
        return (
            db.query(PatientAppointment)
            .filter(PatientAppointment.user_id == user_id)
            .order_by(PatientAppointment.appointment_date.desc())
            .all()
        )