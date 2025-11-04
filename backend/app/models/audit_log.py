from __future__ import annotations

import datetime as dt
from typing import Optional

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_log"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    action: str = Field(max_length=100, nullable=False)
    entity: str = Field(max_length=100, nullable=False)
    entity_id: str = Field(max_length=100, nullable=False)
    diff_json: dict = Field(default_factory=dict, sa_column=Column(JSON, nullable=False, default=dict))
    at: dt.datetime = Field(default_factory=dt.datetime.utcnow, nullable=False)
