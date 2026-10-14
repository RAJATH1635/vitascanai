from pydantic import BaseModel



class BreastCancerPredictionResponse(BaseModel):
    prediction: str
    confidence: float