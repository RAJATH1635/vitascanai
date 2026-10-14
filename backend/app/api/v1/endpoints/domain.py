
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Any
from app.api import deps
from app.schemas.domain import (
    PatientCreate, PatientUpdate, PatientResponse, PaginatedResponse,
    DoctorCreate, DoctorUpdate, DoctorResponse,
    DiseaseCategoryCreate, DiseaseCategoryUpdate, DiseaseCategoryResponse
)
from app.services.domain import patient_service, doctor_service, disease_category_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/patients", response_model=PatientResponse, dependencies=[Depends(deps.RoleChecker(["ADMIN", "PATIENT"]))])
def create_patient(obj_in: PatientCreate, db: Session = Depends(deps.get_db)):
    logger.info(f"Creating patient profile for user: {obj_in.user_id}")
    return patient_service.create(db, obj_in)

@router.get("/patients", response_model=PaginatedResponse[PatientResponse], dependencies=[Depends(deps.RoleChecker(["ADMIN", "DOCTOR"]))])
def get_patients(db: Session = Depends(deps.get_db), pagination: dict = Depends(deps.pagination_params)):
    return patient_service.get_list(db, **pagination)

@router.post("/doctors", response_model=DoctorResponse, dependencies=[Depends(deps.RoleChecker(["ADMIN", "DOCTOR"]))])
def create_doctor(obj_in: DoctorCreate, db: Session = Depends(deps.get_db)):
    return doctor_service.create(db, obj_in)

@router.get("/doctors", response_model=PaginatedResponse[DoctorResponse])
def get_doctors(db: Session = Depends(deps.get_db), pagination: dict = Depends(deps.pagination_params)):
    return doctor_service.get_list(db, **pagination)

@router.post("/disease-categories", response_model=DiseaseCategoryResponse, dependencies=[Depends(deps.RoleChecker(["ADMIN"]))])
def create_disease_category(obj_in: DiseaseCategoryCreate, db: Session = Depends(deps.get_db)):
    return disease_category_service.create(db, obj_in)

@router.get("/disease-categories", response_model=PaginatedResponse[DiseaseCategoryResponse])
def get_disease_categories(db: Session = Depends(deps.get_db), pagination: dict = Depends(deps.pagination_params)):
    return disease_category_service.get_list(db, search_fields=["name", "description"], **pagination)
