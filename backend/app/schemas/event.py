from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class EventBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    start: datetime
    end: datetime
    all_day: bool = False
    source: Literal["local", "google", "caldav"] = "local"
    color: Optional[str] = Field(default=None, max_length=20)
    notes: Optional[str] = None
    created_by: Optional[str] = Field(default=None, max_length=100)
    assignee_id: Optional[int] = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=200)
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    all_day: Optional[bool] = None
    source: Optional[Literal["local", "google", "caldav"]] = None
    color: Optional[str] = Field(default=None, max_length=20)
    notes: Optional[str] = None
    created_by: Optional[str] = Field(default=None, max_length=100)
    assignee_id: Optional[int] = None


class EventRead(EventBase):
    id: int
