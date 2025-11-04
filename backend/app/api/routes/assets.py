from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlmodel import Session

from app.api.deps import get_current_user, get_session
from app.models.user import User
from app.schemas.asset import AssetImportResponse, AssetSummaryResponse
from app.services import assets as asset_service

router = APIRouter(prefix="/assets", tags=["assets"])


@router.post("/import", response_model=AssetImportResponse, status_code=status.HTTP_202_ACCEPTED)
def import_assets(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> AssetImportResponse:
    if file.content_type not in {"text/csv", "application/vnd.ms-excel"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid content type")
    return asset_service.import_asset_csv(session, file)


@router.get("/summary", response_model=AssetSummaryResponse)
def summarize_assets(
    from_month: Optional[str] = None,
    to_month: Optional[str] = None,
    session: Session = Depends(get_session),
) -> AssetSummaryResponse:
    return asset_service.summarize_assets(session, from_month, to_month)
