import csv
from collections import defaultdict
from datetime import date
from io import StringIO, TextIOWrapper
from typing import Dict, Iterable, List, Optional, TextIO

from fastapi import UploadFile
from sqlmodel import Session, select

from app.models.asset_snapshot import AssetSnapshot
from app.schemas.asset import (
    AssetImportResponse,
    AssetImportRowError,
    AssetSnapshotRead,
    AssetSummaryItem,
    AssetSummaryResponse,
)


def _open_csv(upload: UploadFile) -> Iterable[Dict[str, str]]:
    content = upload.file.read().decode("utf-8")
    upload.file.seek(0)
    reader = csv.DictReader(StringIO(content))
    return list(reader)


def import_asset_csv(session: Session, upload: UploadFile) -> AssetImportResponse:
    response = AssetImportResponse()
    rows = _open_csv(upload)
    for index, row in enumerate(rows, start=2):
        try:
            snapshot = AssetSnapshot(
                date=date.fromisoformat(row["date"]),
                account_name=row["account_name"],
                balance=float(row["balance"]),
                currency=row["currency"],
            )
            session.add(snapshot)
            response.imported += 1
        except Exception as exc:  # noqa: BLE001
            response.failed.append(AssetImportRowError(line_number=index, error=str(exc)))
    session.commit()
    return response


def list_snapshots(session: Session) -> List[AssetSnapshotRead]:
    statement = select(AssetSnapshot).order_by(AssetSnapshot.date.desc())
    results = session.exec(statement).all()
    return [
        AssetSnapshotRead(
            id=record.id,
            date=record.date,
            account_name=record.account_name,
            balance=record.balance,
            currency=record.currency,
        )
        for record in results
    ]


def summarize_assets(session: Session, month_from: Optional[str], month_to: Optional[str]) -> AssetSummaryResponse:
    statement = select(AssetSnapshot)
    if month_from:
        year, month = map(int, month_from.split("-"))
        statement = statement.where(AssetSnapshot.date >= date(year, month, 1))
    if month_to:
        year, month = map(int, month_to.split("-"))
        if month == 12:
            statement = statement.where(AssetSnapshot.date < date(year + 1, 1, 1))
        else:
            statement = statement.where(AssetSnapshot.date < date(year, month + 1, 1))
    statement = statement.order_by(AssetSnapshot.date.asc())

    bucket: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))
    for snapshot in session.exec(statement).all():
        month_key = snapshot.date.strftime("%Y-%m")
        bucket[month_key][snapshot.currency] += snapshot.balance

    items = [
        AssetSummaryItem(month=month, totals=dict(currency_totals))
        for month, currency_totals in sorted(bucket.items(), key=lambda item: item[0])
    ]
    return AssetSummaryResponse(items=items)
