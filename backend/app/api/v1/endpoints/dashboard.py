from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User

from app.schemas.dashboard import (
    DashboardSummary,
    RecentPrediction,
    DiseaseDistribution,
    ConfidenceTrend,
)

from app.services.dashboard import DashboardService

router = APIRouter()


# ==========================================
# Dashboard Summary
# ==========================================

@router.get(
    "/dashboard/summary",
    response_model=DashboardSummary,
)
def dashboard_summary(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    return DashboardService.summary(
        db,
        current_user.id,
    )


# ==========================================
# Recent Predictions
# ==========================================

@router.get(
    "/dashboard/recent",
    response_model=List[RecentPrediction],
)
def recent_predictions(
    limit: int = 5,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    return DashboardService.recent(
        db,
        current_user.id,
        limit,
    )


# ==========================================
# Disease Distribution
# ==========================================

@router.get(
    "/dashboard/distribution",
    response_model=List[DiseaseDistribution],
)
def disease_distribution(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    return DashboardService.distribution(
        db,
        current_user.id,
    )


# ==========================================
# Confidence Trend
# ==========================================

@router.get(
    "/dashboard/confidence-trend",
    response_model=List[ConfidenceTrend],
)
def confidence_trend(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    return DashboardService.confidence_trend(
        db,
        current_user.id,
    )