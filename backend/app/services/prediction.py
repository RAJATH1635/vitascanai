from sqlalchemy.orm import Session

from app.crud.prediction import (
    create_prediction,
    get_user_predictions
)

from app.schemas.prediction import PredictionCreate


class PredictionService:

    @staticmethod
    def save_prediction(
        db: Session,
        user_id: str,
        prediction: PredictionCreate
    ):
        return create_prediction(
            db,
            user_id,
            prediction
        )

    @staticmethod
    def history(
        db: Session,
        user_id: str
    ):
        return get_user_predictions(
            db,
            user_id
        )