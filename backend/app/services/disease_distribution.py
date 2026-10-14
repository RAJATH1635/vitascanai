from sqlalchemy.orm import Session

from app.crud.disease_distribution import (
    get_disease_distribution,
)


class DiseaseDistributionService:

    @staticmethod
    def distribution(
        db: Session,
        user_id: str,
    ):
        return get_disease_distribution(
            db,
            user_id,
        )