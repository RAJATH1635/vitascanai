from pydantic import BaseModel, ConfigDict, field_serializer
from datetime import datetime
from typing import Optional
from app.core.timezone import format_iso_utc


class PredictionCreate(BaseModel):
    disease: str
    prediction: str
    confidence: float
    image_path: Optional[str] = None


class PredictionResponse(BaseModel):
    id: str
    disease: str
    prediction: str
    confidence: float
    image_path: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("created_at", when_used="json")
    def serialize_created_at(self, dt: datetime) -> Optional[str]:
        return format_iso_utc(dt)