from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_serializer
from app.core.timezone import format_iso_utc


# ==========================================
# Dashboard Summary
# ==========================================

class DashboardSummary(BaseModel):
    total_predictions: int
    total_diseases: int
    average_confidence: float
    last_prediction: Optional[datetime] = None

    @field_serializer("last_prediction", when_used="json")
    def serialize_last_prediction(self, dt: Optional[datetime]) -> Optional[str]:
        return format_iso_utc(dt)


# ==========================================
# Recent Predictions
# ==========================================

class RecentPrediction(BaseModel):
    id: str
    disease: str
    prediction: str
    confidence: float
    image_path: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("created_at", when_used="json")
    def serialize_created_at(self, dt: datetime) -> Optional[str]:
        return format_iso_utc(dt)


# ==========================================
# Disease Distribution
# ==========================================

class DiseaseDistribution(BaseModel):
    name: str
    value: int


# ==========================================
# Confidence Trend
# ==========================================

class ConfidenceTrend(BaseModel):
    date: str
    confidence: float