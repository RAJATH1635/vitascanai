from sqlalchemy.orm import Session

from app.models.prediction import Prediction
from app.schemas.prediction import PredictionCreate


def create_prediction(
    db: Session,
    user_id: str,
    prediction: PredictionCreate
):

    db_prediction = Prediction(
        user_id=user_id,
        disease=prediction.disease,
        prediction=prediction.prediction,
        confidence=prediction.confidence,
        image_path=prediction.image_path
    )

    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)

    return db_prediction


def get_user_predictions(
    db: Session,
    user_id: str
):
    return (
        db.query(Prediction)
        .filter(Prediction.user_id == user_id)
        .order_by(Prediction.created_at.desc())
        .all()
    )