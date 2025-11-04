from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, HttpUrl


class LinkBase(BaseModel):
    title: str
    url: HttpUrl
    tags: List[str] = []


class LinkCreate(LinkBase):
    pass


class LinkRead(LinkBase):
    id: int
    click_count: int
    last_accessed_at: Optional[datetime] = None


class LinkUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[HttpUrl] = None
    tags: Optional[List[str]] = None


class LinkSearchResponse(BaseModel):
    results: List[LinkRead]

