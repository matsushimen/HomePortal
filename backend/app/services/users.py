from typing import List, Optional

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.schemas.user import UserRead
from app.core.config import settings


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    return session.exec(select(User).where(User.email == email)).first()


def create_user(session: Session, payload: RegisterRequest) -> User:
    existing = get_user_by_email(session, payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(
        name=payload.name,
        email=payload.email,
        role=payload.role,  # type: ignore[arg-type]
        password_hash=get_password_hash(payload.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(session, email)
    if user is None or user.password_hash is None:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def list_users(session: Session) -> List[UserRead]:
    users = session.exec(select(User).order_by(User.name.asc())).all()
    return [
        UserRead(id=user.id, name=user.name, role=user.role, email=user.email)
        for user in users
    ]


def ensure_default_admin(session: Session) -> None:
    if not settings.app_auth_enabled:
        return
    if not settings.default_admin_email or not settings.default_admin_password:
        return
    existing = get_user_by_email(session, settings.default_admin_email)
    if existing is not None:
        return
    admin = User(
        name="Administrator",
        email=settings.default_admin_email,
        role="admin",
        password_hash=get_password_hash(settings.default_admin_password),
    )
    session.add(admin)
    session.commit()
