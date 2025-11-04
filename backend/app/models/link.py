from __future__ import annotations

import datetime as dt
from typing import List, Optional

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel

from app.models.common import OwnedModel


class Link(OwnedModel, table=True):
    __tablename__ = "link"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, index=True, nullable=False)
    url: str = Field(max_length=500, nullable=False)
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON, nullable=False, default=list))
    click_count: int = Field(default=0, nullable=False)
    last_accessed_at: Optional[dt.datetime] = Field(default=None, nullable=True)
