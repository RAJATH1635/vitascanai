from pathlib import Path
import shutil
import uuid

from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User

from app.ai.malaria.predictor import predict_malaria

from app.schemas.prediction import PredictionCreate
from app.services.prediction import PredictionService

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/predict/malaria")
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

    result = predict_malaria(str(filepath))

    PredictionService.save_prediction(
        db=db,
        user_id=current_user.id,
        prediction=PredictionCreate(
            disease="Malaria",
            prediction=result["prediction"],
            confidence=result["confidence"],
            image_path=str(filepath),
        ),
    )

    return result