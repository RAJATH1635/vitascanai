
from app.crud.base import CRUDBase
from app.models.domain import Patient, Doctor, DiseaseCategory, MedicalImage, AIPrediction
from app.schemas.domain import (
    PatientCreate, PatientUpdate, 
    DoctorCreate, DoctorUpdate,
    DiseaseCategoryCreate, DiseaseCategoryUpdate,
    MedicalImageCreate, MedicalImageUpdate,
    AIPredictionCreate, AIPredictionCreate # dummy update
)

class CRUDPatient(CRUDBase[Patient, PatientCreate, PatientUpdate]): pass
class CRUDDoctor(CRUDBase[Doctor, DoctorCreate, DoctorUpdate]): pass
class CRUDDiseaseCategory(CRUDBase[DiseaseCategory, DiseaseCategoryCreate, DiseaseCategoryUpdate]): pass
class CRUDMedicalImage(CRUDBase[MedicalImage, MedicalImageCreate, MedicalImageUpdate]): pass
class CRUDAIPrediction(CRUDBase[AIPrediction, AIPredictionCreate, AIPredictionCreate]): pass

patient = CRUDPatient(Patient)
doctor = CRUDDoctor(Doctor)
disease_category = CRUDDiseaseCategory(DiseaseCategory)
medical_image = CRUDMedicalImage(MedicalImage)
ai_prediction = CRUDAIPrediction(AIPrediction)
