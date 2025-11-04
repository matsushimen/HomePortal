from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


class TodoBase(BaseModel):
    title: str
    status: Literal["open", "done"] = "open"
    due: Optional[datetime] = None
    assignee_id: Optional[int] = None
    repeat_rule: Optional[str] = None
    list_id: Optional[str] = None


class TodoCreate(TodoBase):
    pass


class TodoRead(TodoBase):
    id: int
    completed_at: Optional[datetime] = None


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[Literal["open", "done"]] = None
    due: Optional[datetime] = None
    assignee_id: Optional[int] = None
    repeat_rule: Optional[str] = None
    list_id: Optional[str] = None
    completed_at: Optional[datetime] = None

