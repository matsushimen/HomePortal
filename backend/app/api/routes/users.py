from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.api.deps import get_current_user, get_session
from app.models.user import User
from app.schemas.user import UserRead
from app.services import users as user_service

router = APIRouter(tags=["users"])


@router.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)) -> UserRead:
    return UserRead(id=current_user.id, name=current_user.name, role=current_user.role, email=current_user.email)


@router.get("/users", response_model=list[UserRead])
def list_users(session: Session = Depends(get_session)) -> list[UserRead]:
    return user_service.list_users(session)

