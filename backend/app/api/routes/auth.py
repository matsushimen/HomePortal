from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import Session

from app.api.deps import get_current_user, get_session
from app.core.config import settings
from app.core.security import create_access_token
from app.schemas.auth import LoginRequest, RegisterRequest, Token
from app.schemas.user import UserRead
from app.services import users as user_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, session: Session = Depends(get_session)) -> UserRead:
    if not settings.app_auth_enabled:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Registration disabled")
    user = user_service.create_user(session, payload)
    return UserRead(id=user.id, name=user.name, role=user.role, email=user.email)


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, response: Response, session: Session = Depends(get_session)) -> Token:
    if not settings.app_auth_enabled:
        # Issue public token referencing default household user
        token = create_access_token({"sub": "default@local"}, expires_delta=timedelta(minutes=settings.access_token_expire_minutes))
        set_session_cookie(response, token)
        return Token(access_token=token)
    user = user_service.authenticate_user(session, payload.email, payload.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    token = create_access_token({"sub": user.email}, expires_delta=timedelta(minutes=settings.access_token_expire_minutes))
    set_session_cookie(response, token)
    return Token(access_token=token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    response.delete_cookie("homeportal_token")


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="homeportal_token",
        value=token,
        httponly=True,
        secure=settings.app_env == "production",
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )
