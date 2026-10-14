from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User

from app.schemas.disease_distribution import DiseaseDistribution
from app.services.disease_distribution import DiseaseDistributionService

router = APIRouter()


@router.get(
    "/dashboard/disease-distribution",
    response_model=List[DiseaseDistribution],
)
def disease_distribution(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    return DiseaseDistributionService.distribution(
        db,
        current_user.id,
    )