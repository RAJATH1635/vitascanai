from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.services.upload_service import upload_service

router = APIRouter()


@router.post("/upload")
def upload_medical_file(
    file: UploadFile = File(...),
    disease_type: str = Form(...),
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_active_user),
):
    if current_user.role not in ["PATIENT", "ADMIN", "DOCTOR"]:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to upload files."
        )

    return upload_service.process_upload(
        db,
        current_user.id,
        file,
        disease_type
    )