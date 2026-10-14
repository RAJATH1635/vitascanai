from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.prediction import Prediction


def get_disease_distribution(
    db: Session,
    user_id: str,
):
    return (
        db.query(
            Prediction.disease,
            func.count(Prediction.id).label("count"),
        )
        .filter(Prediction.user_id == user_id)
        .group_by(Prediction.disease)
        .all()
    )