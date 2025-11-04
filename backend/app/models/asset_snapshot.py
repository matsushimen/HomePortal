from __future__ import annotations

import datetime as dt
from typing import Optional

from sqlmodel import Field, SQLModel


class AssetSnapshot(SQLModel, table=True):
    __tablename__ = "asset_snapshot"

    id: Optional[int] = Field(default=None, primary_key=True)
    date: dt.date = Field(nullable=False, index=True)
    account_name: str = Field(max_length=200, nullable=False)
    balance: float = Field(nullable=False)
    currency: str = Field(max_length=10, nullable=False)
