from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.prediction import Prediction
from app.core.timezone import as_ist


# ===========================
# Dashboard Summary
# ===========================
def get_dashboard_summary(db: Session, user_id: str):

    total_predictions = (
        db.query(Prediction)
        .filter(Prediction.user_id == user_id)
        .count()
    )

    total_diseases = (
        db.query(Prediction.disease)
        .filter(Prediction.user_id == user_id)
        .distinct()
        .count()
    )

    average_confidence = (
        db.query(func.avg(Prediction.confidence))
        .filter(Prediction.user_id == user_id)
        .scalar()
    )

    last_prediction = (
        db.query(Prediction)
        .filter(Prediction.user_id == user_id)
        .order_by(Prediction.created_at.desc())
        .first()
    )

    return {
        "total_predictions": total_predictions,
        "total_diseases": total_diseases,
        "average_confidence": round(average_confidence or 0, 2),
        "last_prediction": (
            last_prediction.created_at
            if last_prediction
            else None
        ),
    }


# ===========================
# Recent Predictions
# ===========================
def get_recent_predictions(
    db: Session,
    user_id: str,
    limit: int = 5,
):
    return (
        db.query(Prediction)
        .filter(Prediction.user_id == user_id)
        .order_by(Prediction.created_at.desc())
        .limit(limit)
        .all()
    )


# ===========================
# Disease Distribution
# ===========================
def get_disease_distribution(
    db: Session,
    user_id: str,
):
    results = (
        db.query(
            Prediction.disease,
            func.count(Prediction.id).label("count"),
        )
        .filter(Prediction.user_id == user_id)
        .group_by(Prediction.disease)
        .all()
    )

    return [
        {
            "name": disease,
            "value": count,
        }
        for disease, count in results
    ]


# ===========================
# Confidence Trend
# ===========================
def get_confidence_trend(
    db: Session,
    user_id: str,
):
    results = (
        db.query(Prediction)
        .filter(Prediction.user_id == user_id)
        .order_by(Prediction.created_at.asc())
        .all()
    )

    return [
        {
            "date": as_ist(prediction.created_at).strftime("%d-%m") if prediction.created_at else "N/A",
            "confidence": prediction.confidence,
        }
        for prediction in results
    ]