from pydantic import BaseModel



class MalariaPredictionResponse(BaseModel):
    prediction: str
    confidence: float