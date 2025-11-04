from fastapi import APIRouter

from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/healthz", response_model=HealthResponse, tags=["health"])
def healthz() -> HealthResponse:
    return HealthResponse(status="ok")

