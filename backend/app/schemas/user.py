from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    name: str
    role: Literal["admin", "user", "kid"] = Field(default="user")


class UserRead(UserBase):
    id: int
    email: Optional[EmailStr] = None


class UserCreate(UserBase):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[Literal["admin", "user", "kid"]] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

