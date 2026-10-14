from sqlalchemy.orm import Session

from app.crud.recent_predictions import get_recent_predictions


class RecentPredictionService:

    @staticmethod
    def get_recent(
        db: Session,
        user_id: str,
        limit: int = 5,
    ):
        return get_recent_predictions(
            db,
            user_id,
            limit,
        )