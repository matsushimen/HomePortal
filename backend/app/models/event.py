from __future__ import annotations

import datetime as dt
from enum import Enum
from typing import Optional

from sqlalchemy import Column, Text
from sqlmodel import Field, SQLModel


class EventSource(str, Enum):
    local = "local"
    google = "google"
    caldav = "caldav"


class Event(SQLModel, table=True):
    __tablename__ = "event"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, nullable=False)
    start: dt.datetime = Field(nullable=False)
    end: dt.datetime = Field(nullable=False)
    all_day: bool = Field(default=False, nullable=False)
    source: EventSource = Field(default=EventSource.local)
    color: Optional[str] = Field(default=None, max_length=20)
    notes: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    created_by: Optional[str] = Field(default=None, max_length=100)
    assignee_id: Optional[int] = Field(default=None, foreign_key="user.id")
