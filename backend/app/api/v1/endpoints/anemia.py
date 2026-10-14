from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User

from app.schemas.anemia import AnemiaRequest, AnemiaResponse
from app.schemas.prediction import PredictionCreate

from app.services.prediction import PredictionService
from app.ai.anemia.predictor import predict_anemia

router = APIRouter()


@router.post(
    "/predict/anemia",
    response_model=AnemiaResponse,
    tags=["Anemia"],
)
def predict(
    request: AnemiaRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):

    result = predict_anemia(
        gender=request.gender,
        hemoglobin=request.hemoglobin,
        mch=request.mch,
        mchc=request.mchc,
        mcv=request.mcv,
    )

    PredictionService.save_prediction(
        db=db,
        user_id=current_user.id,
        prediction=PredictionCreate(
            disease="Anemia",
            prediction=result["prediction"],
            confidence=result["confidence"],
            image_path=None,
        ),
    )

    return result