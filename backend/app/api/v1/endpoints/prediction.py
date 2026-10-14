from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.schemas.prediction import PredictionResponse
from app.services.prediction import PredictionService

router = APIRouter()


@router.get(
    "/history",
    response_model=list[PredictionResponse]
)
def prediction_history(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return PredictionService.history(
        db,
        current_user.id
    )