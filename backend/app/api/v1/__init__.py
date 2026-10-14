
from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    domain,
    uploads,
    anemia,
    breast_cancer,
    malaria,
    dementia,
    prediction,
    dashboard,
    recent_predictions,
    disease_distribution,
    confidence_trend,
    reports,
    patient_appointments,
    doctor,
    search,
)


api_router = APIRouter()
api_router.include_router(health.router, prefix="/system", tags=["system"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(domain.router, prefix="/medical", tags=["medical"])

api_router.include_router(uploads.router, prefix='/medical', tags=['medical-uploads'])


api_router.include_router(
    anemia.router,
    prefix="/medical",
    tags=["medical-anemia"],
)

api_router.include_router(
    breast_cancer.router,
    prefix="/medical",
    tags=["medical-breast-cancer"],
)

api_router.include_router(
    malaria.router,
    prefix="/medical",
    tags=["medical-malaria"],
)

api_router.include_router(
    dementia.router,
    prefix="/medical",
    tags=["medical-dementia"],
)

api_router.include_router(
    prediction.router,
    prefix="/medical",
    tags=["medical-history"],
)

api_router.include_router(
    dashboard.router,
    prefix="/medical",
    tags=["dashboard"],
)

api_router.include_router(
    recent_predictions.router,
    prefix="/medical",
    tags=["dashboard"],
)

api_router.include_router(
    disease_distribution.router,
    prefix="/medical",
    tags=["dashboard"],
)

api_router.include_router(
    confidence_trend.router,
    prefix="/medical",
    tags=["dashboard"],
)

api_router.include_router(
    reports.router,
    prefix="/medical",
    tags=["reports"],
)

api_router.include_router(
    patient_appointments.router,
    prefix="/medical/appointments",
    tags=["appointments"],
)

api_router.include_router(
    doctor.router,
    prefix="/doctor",
    tags=["Doctor"],
)
api_router.include_router(
    search.router,
    prefix="/search",
    tags=["search"],
)