from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User

from app.schemas.confidence_trend import ConfidenceTrend
from app.services.confidence_trend import ConfidenceTrendService

router = APIRouter()


@router.get(
    "/dashboard/confidence-trend",
    response_model=List[ConfidenceTrend],
)
def confidence_trend(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    return ConfidenceTrendService.trend(
        db,
        current_user.id,
    )