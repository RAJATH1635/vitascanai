from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.core.database import get_db
from app.models.user import User
from app.schemas.report import (
    ReportResponse,
    ReportDetailResponse,
)
from app.services.report import ReportService

router = APIRouter()


@router.get(
    "/reports",
    response_model=List[ReportResponse],
)
def get_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    return ReportService.get_reports(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/reports/{report_id}",
    response_model=ReportDetailResponse,
)
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    report = ReportService.get_report(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
    )

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )

    return report