from typing import Generator, Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import Session, select

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.session import session_scope
from app.models.user import User
from app.schemas.auth import TokenPayload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def get_session() -> Generator[Session, None, None]:
    with session_scope() as session:
        yield session


def get_current_user(
    request: Request,
    session: Session = Depends(get_session),
    token: str | None = Depends(oauth2_scheme),
) -> User:
    if not settings.app_auth_enabled:
        default_user = session.exec(select(User).where(User.email == "default@local")).first()
        if default_user is None:
            user = User(name="Household", role="admin", email="default@local", password_hash=get_password_hash("changeme"))
            session.add(user)
            session.commit()
            session.refresh(user)
            return user
        return default_user
    if token is None and request is not None:
        token = request.cookies.get("homeportal_token")
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        token_data = TokenPayload(**payload)
    except JWTError as exc:
        raise credentials_exception from exc

    user: Optional[User] = session.exec(select(User).where(User.email == token_data.sub)).first()
    if user is None:
        raise credentials_exception
    return user
