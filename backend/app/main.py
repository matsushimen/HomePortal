from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import assets, auth, contacts, events, health, links, todos, users
from app.core.config import settings
from app.db.session import init_db, session_scope
from app.services.users import ensure_default_admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    with session_scope() as session:
        ensure_default_admin(session)
    yield


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(auth.router)
    app.include_router(users.router)
    app.include_router(links.router)
    app.include_router(contacts.router)
    app.include_router(assets.router)
    app.include_router(events.router)
    app.include_router(todos.router)

    return app


app = create_app()
