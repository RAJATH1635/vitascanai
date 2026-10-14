from pydantic import BaseModel


class DiseaseDistribution(BaseModel):
    disease: str
    count: int