from typing import List

from sqlmodel import Session, select

from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactUpdate


def list_contacts(session: Session) -> List[Contact]:
    statement = select(Contact).order_by(Contact.category.asc(), Contact.name.asc())
    return list(session.exec(statement).all())


def create_contact(session: Session, payload: ContactCreate) -> Contact:
    contact = Contact(**payload.dict())
    session.add(contact)
    session.commit()
    session.refresh(contact)
    return contact


def update_contact(session: Session, contact_id: int, payload: ContactUpdate) -> Contact:
    contact = session.get(Contact, contact_id)
    if contact is None:
        raise ValueError("Contact not found")
    update_data = payload.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contact, field, value)
    session.add(contact)
    session.commit()
    session.refresh(contact)
    return contact


def delete_contact(session: Session, contact_id: int) -> None:
    contact = session.get(Contact, contact_id)
    if contact is None:
        raise ValueError("Contact not found")
    session.delete(contact)
    session.commit()

