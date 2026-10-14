
from app.services.base import BaseService
from app.crud import domain as crud
from sqlalchemy.orm import Session
from fastapi import HTTPException

class PatientService(BaseService):
    def __init__(self):
        super().__init__(crud.patient)
        
    def create(self, db: Session, obj_in):
        # check duplicate user_id
        existing = crud.patient.get_multi(db, filters={"user_id": obj_in.user_id})
        if existing:
            raise HTTPException(status_code=400, detail="Patient profile already exists for this user")
        return super().create(db, obj_in)

class DoctorService(BaseService):
    def __init__(self):
        super().__init__(crud.doctor)
        
    def create(self, db: Session, obj_in):
        existing = crud.doctor.get_multi(db, filters={"user_id": obj_in.user_id})
        if existing:
            raise HTTPException(status_code=400, detail="Doctor profile already exists for this user")
        existing_license = crud.doctor.get_multi(db, filters={"license_number": obj_in.license_number})
        if existing_license:
            raise HTTPException(status_code=400, detail="License number already registered")
        return super().create(db, obj_in)

patient_service = PatientService()
doctor_service = DoctorService()
disease_category_service = BaseService(crud.disease_category)
medical_image_service = BaseService(crud.medical_image)
ai_prediction_service = BaseService(crud.ai_prediction)
