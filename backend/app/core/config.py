from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = Field(default="HomePortal API")
    app_env: Literal["development", "production", "test"] = Field(default="development")
    app_auth_enabled: bool = Field(default=False)
    secret_key: str = Field(default="change-this-secret")
    access_token_expire_minutes: int = Field(default=60 * 24)

    database_url: str = Field(default="sqlite:///data/homeportal.db")
    database_echo: bool = Field(default=False)

    default_admin_email: str | None = Field(default=None)
    default_admin_password: str | None = Field(default=None)

    google_calendar_json_base64: str | None = Field(default=None)
    google_calendar_id: str | None = Field(default=None)

    backup_directory: Path = Field(default=Path("/var/backups/app"))

    @validator("database_url")
    def ensure_sqlite_path(cls, value: str) -> str:
        if value.startswith("sqlite:///"):
            path = value.replace("sqlite:///", "", 1)
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        return value


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

