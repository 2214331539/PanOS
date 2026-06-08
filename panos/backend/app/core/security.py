import hmac
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Annotated

import jwt
from fastapi import Header, HTTPException, status

from app.core.config import get_settings

_ALGORITHM = "HS256"


@dataclass(frozen=True)
class AdminPrincipal:
    user_id: str
    email: str
    role: str


def verify_credentials(username: str, password: str) -> bool:
    """常量时间比对账号密码（V1 本地鉴权；目标仍 Supabase Auth）。"""
    settings = get_settings()
    user_ok = hmac.compare_digest(username, settings.admin_username)
    pass_ok = hmac.compare_digest(password, settings.admin_password)
    return user_ok and pass_ok


def create_access_token() -> tuple[str, datetime]:
    settings = get_settings()
    expires_at = datetime.now(UTC) + timedelta(seconds=settings.auth_token_ttl_seconds)
    token = jwt.encode(
        {"sub": settings.admin_username, "role": "owner", "exp": expires_at},
        settings.auth_secret,
        algorithm=_ALGORITHM,
    )
    return token, expires_at


def _unauthorized(code: str, message: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"error": {"code": code, "message": message}},
    )


async def require_admin_user(
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
) -> AdminPrincipal:
    if not authorization or not authorization.startswith("Bearer "):
        raise _unauthorized("UNAUTHORIZED", "缺少 access token")

    token = authorization.removeprefix("Bearer ").strip()
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.auth_secret, algorithms=[_ALGORITHM])
    except jwt.PyJWTError as exc:
        raise _unauthorized("INVALID_TOKEN", "token 无效或已过期") from exc

    username = str(payload.get("sub", ""))
    return AdminPrincipal(user_id=username, email=username, role=str(payload.get("role", "owner")))
