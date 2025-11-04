from datetime import datetime
from typing import List, Optional

from sqlmodel import Session, select

from app.models.event import Event
from app.schemas.event import EventCreate, EventUpdate


def _parse_datetime(value: str) -> datetime:
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    return datetime.fromisoformat(value)


def list_events(session: Session, start: Optional[str], end: Optional[str]) -> List[Event]:
    statement = select(Event)
    if start:
        start_dt = _parse_datetime(start)
        statement = statement.where(Event.end >= start_dt)
    if end:
        end_dt = _parse_datetime(end)
        statement = statement.where(Event.start <= end_dt)
    statement = statement.order_by(Event.start.asc())
    return list(session.exec(statement).all())


def create_event(session: Session, payload: EventCreate, creator_fallback: Optional[str]) -> Event:
    data = payload.model_dump()
    if not data.get("created_by") and creator_fallback:
        data["created_by"] = creator_fallback
    event = Event(**data)
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


def update_event(session: Session, event_id: int, payload: EventUpdate) -> Event:
    event = session.get(Event, event_id)
    if event is None:
        raise ValueError("Event not found")
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


def delete_event(session: Session, event_id: int) -> None:
    event = session.get(Event, event_id)
    if event is None:
        raise ValueError("Event not found")
    session.delete(event)
    session.commit()
