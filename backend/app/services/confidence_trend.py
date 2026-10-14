from sqlalchemy.orm import Session

from app.crud.confidence_trend import (
    get_confidence_trend,
)


class ConfidenceTrendService:

    @staticmethod
    def trend(
        db: Session,
        user_id: str,
    ):
        return get_confidence_trend(
            db,
            user_id,
        )