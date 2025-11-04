from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session

from app.api.deps import get_current_user, get_session
from app.models.user import User
from app.schemas.event import EventCreate, EventRead, EventUpdate
from app.services import events as event_service

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=List[EventRead])
def list_events(
    start: Optional[str] = Query(default=None, description="ISO8601 start datetime"),
    end: Optional[str] = Query(default=None, description="ISO8601 end datetime"),
    session: Session = Depends(get_session),
) -> List[EventRead]:
    records = event_service.list_events(session, start, end)
    return [EventRead.model_validate(record, from_attributes=True) for record in records]


@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> EventRead:
    record = event_service.create_event(session, payload, creator_fallback=current_user.name if current_user else None)
    return EventRead.model_validate(record, from_attributes=True)


@router.patch("/{event_id}", response_model=EventRead)
def update_event(event_id: int, payload: EventUpdate, session: Session = Depends(get_session)) -> EventRead:
    try:
        record = event_service.update_event(session, event_id, payload)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    return EventRead.model_validate(record, from_attributes=True)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, session: Session = Depends(get_session)) -> None:
    try:
        event_service.delete_event(session, event_id)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
