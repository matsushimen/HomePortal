from datetime import date
from typing import Dict, List

from pydantic import BaseModel, Field


class AssetImportRowError(BaseModel):
    line_number: int
    error: str


class AssetImportResponse(BaseModel):
    imported: int = Field(default=0)
    failed: List[AssetImportRowError] = Field(default_factory=list)


class AssetSnapshotRead(BaseModel):
    id: int
    date: date
    account_name: str
    balance: float
    currency: str


class AssetSummaryItem(BaseModel):
    month: str
    totals: Dict[str, float]


class AssetSummaryResponse(BaseModel):
    items: List[AssetSummaryItem]

