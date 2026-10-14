from sqlalchemy.orm import Session

from app.crud.dashboard import (
    get_dashboard_summary,
    get_recent_predictions,
    get_disease_distribution,
    get_confidence_trend,
)


class DashboardService:

    @staticmethod
    def summary(
        db: Session,
        user_id: str,
    ):
        return get_dashboard_summary(
            db,
            user_id,
        )

    @staticmethod
    def recent(
        db: Session,
        user_id: str,
        limit: int = 5,
    ):
        return get_recent_predictions(
            db,
            user_id,
            limit,
        )

    @staticmethod
    def distribution(
        db: Session,
        user_id: str,
    ):
        return get_disease_distribution(
            db,
            user_id,
        )

    @staticmethod
    def confidence_trend(
        db: Session,
        user_id: str,
    ):
        return get_confidence_trend(
            db,
            user_id,
        )