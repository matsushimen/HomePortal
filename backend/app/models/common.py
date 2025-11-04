from __future__ import annotations

import datetime as dt
from typing import Optional

from sqlmodel import Field, SQLModel


class TimestampedModel(SQLModel):
    created_at: dt.datetime = Field(default_factory=dt.datetime.utcnow, nullable=False)
    updated_at: dt.datetime = Field(default_factory=dt.datetime.utcnow, nullable=False)

    def touch(self) -> None:
        self.updated_at = dt.datetime.utcnow()


class OwnedModel(SQLModel, table=False):
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")
