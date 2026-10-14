from pathlib import Path
import shutil
import uuid

from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User

from app.ai.dementia.predictor import predict_dementia

from app.schemas.prediction import PredictionCreate
from app.services.prediction import PredictionService

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/predict/dementia")
async def predict(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    extension = Path(file.filename).suffix

    filename = f"{uuid.uuid4()}{extension}"

    filepath = UPLOAD_DIR / filename

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        from app.ai.validation import validate_upload, DomainValidationError, ImageValidationError
        validate_upload(str(filepath), "dementia")
    except (DomainValidationError, ImageValidationError) as e:
        if filepath.exists():
            filepath.unlink()
        from fastapi import HTTPException
        raise HTTPException(
            status_code=422,
            detail={
                "error_type": "domain_validation_error",
                "message": str(e),
                "suggestion": "You should upload clear or correct image."
            }
        )

    result = predict_dementia(str(filepath))

    PredictionService.save_prediction(
        db=db,
        user_id=current_user.id,
        prediction=PredictionCreate(
            disease="Dementia",
            prediction=result["prediction"],
            confidence=result["confidence"],
            image_path=str(filepath),
        ),
    )

    return result