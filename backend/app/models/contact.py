from __future__ import annotations

import datetime as dt
from typing import Optional

from sqlmodel import Field, SQLModel


class Contact(SQLModel, table=True):
    __tablename__ = "contact"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=200, index=True, nullable=False)
    category: str = Field(max_length=100, index=True, nullable=False)
    phone: Optional[str] = Field(default=None, max_length=30)
    hours: Optional[str] = Field(default=None, max_length=200)
    url: Optional[str] = Field(default=None, max_length=500)
    notes: Optional[str] = Field(default=None)
    last_verified_at: Optional[dt.datetime] = Field(default=None)
