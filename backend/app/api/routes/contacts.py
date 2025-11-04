from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.api.deps import get_current_user, get_session
from app.models.user import User
from app.schemas.contact import ContactCreate, ContactRead, ContactUpdate
from app.services import contacts as contact_service

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.get("", response_model=List[ContactRead])
def list_contacts(session: Session = Depends(get_session)) -> List[ContactRead]:
    records = contact_service.list_contacts(session)
    return [ContactRead.model_validate(record, from_attributes=True) for record in records]


@router.post("", response_model=ContactRead, status_code=status.HTTP_201_CREATED)
def create_contact(
    payload: ContactCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> ContactRead:
    record = contact_service.create_contact(session, payload)
    return ContactRead.model_validate(record, from_attributes=True)


@router.patch("/{contact_id}", response_model=ContactRead)
def update_contact(
    contact_id: int,
    payload: ContactUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> ContactRead:
    try:
        record = contact_service.update_contact(session, contact_id, payload)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    return ContactRead.model_validate(record, from_attributes=True)


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    try:
        contact_service.delete_contact(session, contact_id)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
