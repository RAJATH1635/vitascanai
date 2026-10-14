from pydantic import BaseModel, Field


class AnemiaRequest(BaseModel):
    gender: int = Field(..., ge=0, le=1)
    hemoglobin: float
    mch: float
    mchc: float
    mcv: float


class AnemiaResponse(BaseModel):
    prediction: str
    confidence: float