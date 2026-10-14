
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class BaseSchema(BaseModel):
    id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    status: Optional[str] = None
    
    class Config:
        from_attributes = True

# Patient
class PatientCreate(BaseModel):
    user_id: str
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    medical_history: Optional[str] = None

class PatientUpdate(BaseModel):
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    medical_history: Optional[str] = None
    status: Optional[str] = None

class PatientResponse(BaseSchema, PatientCreate):
    pass

# Doctor
class DoctorCreate(BaseModel):
    user_id: str
    specialization: str
    license_number: str
    experience_years: Optional[float] = 0
    bio: Optional[str] = None

class DoctorUpdate(BaseModel):
    specialization: Optional[str] = None
    experience_years: Optional[float] = None
    bio: Optional[str] = None
    status: Optional[str] = None

class DoctorResponse(BaseSchema, DoctorCreate):
    pass

# DiseaseCategory
class DiseaseCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class DiseaseCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class DiseaseCategoryResponse(BaseSchema, DiseaseCategoryCreate):
    pass

# MedicalImage
class MedicalImageCreate(BaseModel):
    patient_id: str
    disease_category_id: str
    file_url: str
    metadata_json: Optional[Dict[str, Any]] = None

class MedicalImageUpdate(BaseModel):
    metadata_json: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class MedicalImageResponse(BaseSchema, MedicalImageCreate):
    pass

# AIPrediction
class AIPredictionCreate(BaseModel):
    image_id: Optional[str] = None
    clinical_data_id: Optional[str] = None
    model_id: str
    result_class: str
    confidence_score: float

class AIPredictionResponse(BaseSchema, AIPredictionCreate):
    pass

# Generic Paginated Response
from typing import Generic, TypeVar
T = TypeVar('T')
class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
