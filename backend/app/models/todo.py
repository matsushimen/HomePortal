from __future__ import annotations

import datetime as dt
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class TodoStatus(str, Enum):
    open = "open"
    done = "done"


class Todo(SQLModel, table=True):
    __tablename__ = "todo"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, nullable=False)
    status: TodoStatus = Field(default=TodoStatus.open, index=True)
    due: Optional[dt.datetime] = Field(default=None)
    assignee_id: Optional[int] = Field(default=None, foreign_key="user.id")
    repeat_rule: Optional[str] = Field(default=None, max_length=100)
    list_id: Optional[str] = Field(default=None, max_length=50)
    completed_at: Optional[dt.datetime] = Field(default=None)
