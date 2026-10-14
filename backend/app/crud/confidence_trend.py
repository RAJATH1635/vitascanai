from sqlalchemy.orm import Session

from app.models.prediction import Prediction


def get_confidence_trend(
    db: Session,
    user_id: str,
):
    return (
        db.query(
            Prediction.created_at,
            Prediction.confidence,
        )
        .filter(Prediction.user_id == user_id)
        .order_by(Prediction.created_at.asc())
        .all()
    )