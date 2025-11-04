from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.api.deps import get_current_user, get_session
from app.models.user import User
from app.schemas.link import LinkCreate, LinkRead, LinkSearchResponse, LinkUpdate
from app.services import links as link_service

router = APIRouter(prefix="/links", tags=["links"])


@router.get("", response_model=List[LinkRead])
def list_links(session: Session = Depends(get_session)) -> List[LinkRead]:
    records = link_service.list_links(session)
    return [LinkRead.model_validate(link, from_attributes=True) for link in records]


@router.post("", response_model=LinkRead, status_code=status.HTTP_201_CREATED)
def create_link(
    payload: LinkCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> LinkRead:
    record = link_service.create_link(session, payload, owner_id=current_user.id)
    return LinkRead.model_validate(record, from_attributes=True)


@router.patch("/{link_id}", response_model=LinkRead)
def update_link(link_id: int, payload: LinkUpdate, session: Session = Depends(get_session)) -> LinkRead:
    try:
        record = link_service.update_link(session, link_id, payload)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    return LinkRead.model_validate(record, from_attributes=True)


@router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_link(link_id: int, session: Session = Depends(get_session)) -> None:
    try:
        link_service.delete_link(session, link_id)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error


@router.get("/search", response_model=LinkSearchResponse)
def search_links(
    q: Optional[str] = Query(default=None, description="Partial title or URL"),
    tags: Optional[List[str]] = Query(default=None),
    session: Session = Depends(get_session),
) -> LinkSearchResponse:
    records = link_service.search_links(session, q, tags)
    return LinkSearchResponse(results=[LinkRead.model_validate(record, from_attributes=True) for record in records])


@router.post("/{link_id}/click", response_model=LinkRead)
def register_link_click(link_id: int, session: Session = Depends(get_session)) -> LinkRead:
    try:
        record = link_service.register_click(session, link_id)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    return LinkRead.model_validate(record, from_attributes=True)
