from datetime import datetime
from typing import Optional

from pydantic import BaseModel, HttpUrl


class ContactBase(BaseModel):
    name: str
    category: str
    phone: Optional[str] = None
    hours: Optional[str] = None
    url: Optional[HttpUrl] = None
    notes: Optional[str] = None


class ContactCreate(ContactBase):
    pass


class ContactRead(ContactBase):
    id: int
    last_verified_at: Optional[datetime] = None


class ContactUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    phone: Optional[str] = None
    hours: Optional[str] = None
    url: Optional[HttpUrl] = None
    notes: Optional[str] = None
    last_verified_at: Optional[datetime] = None

