from pydantic import BaseModel





class DementiaPredictionResponse(BaseModel):
    prediction: str
    confidence: float