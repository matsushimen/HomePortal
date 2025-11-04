from __future__ import annotations

from typing import List, Optional

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class File(SQLModel, table=True):
    __tablename__ = "file"

    id: Optional[int] = Field(default=None, primary_key=True)
    path: str = Field(max_length=500, nullable=False, unique=True)
    tags: List[str] = Field(default_factory=list, sa_column=Column(JSON, nullable=False, default=list))
    protected: bool = Field(default=False, nullable=False)
    checksum: str = Field(max_length=128, nullable=False)
