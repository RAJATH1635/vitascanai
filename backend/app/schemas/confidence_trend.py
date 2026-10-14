from datetime import datetime
from pydantic import BaseModel


class ConfidenceTrend(BaseModel):
    created_at: datetime
    confidence: float