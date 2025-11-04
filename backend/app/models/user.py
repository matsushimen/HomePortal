from __future__ import annotations

from enum import Enum
from typing import Optional

from sqlalchemy import Column, String
from sqlmodel import Field, SQLModel


class UserRole(str, Enum):
    admin = "admin"
    user = "user"
    kid = "kid"


class User(SQLModel, table=True):
    __tablename__ = "user"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, nullable=False)
    role: UserRole = Field(default=UserRole.user)
    email: Optional[str] = Field(default=None, unique=True, index=True, max_length=255)
    password_hash: Optional[str] = Field(
        default=None,
        sa_column=Column(String(length=255), nullable=True),
    )
