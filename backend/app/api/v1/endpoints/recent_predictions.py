from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User

from app.schemas.recent_predictions import RecentPrediction
from app.services.recent_predictions import RecentPredictionService

router = APIRouter()


@router.get(
    "/dashboard/recent",
    response_model=List[RecentPrediction],
)
def recent_predictions(
    limit: int = 5,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    return RecentPredictionService.get_recent(
        db,
        current_user.id,
        limit,
    )