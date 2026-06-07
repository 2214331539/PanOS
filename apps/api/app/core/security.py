from dataclasses import dataclass
from typing import Annotated

from fastapi import Header, HTTPException, status


@dataclass(frozen=True)
class AdminPrincipal:
    user_id: str
    email: str
    role: str


async def require_admin_user(
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
) -> AdminPrincipal:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "缺少 Supabase access token",
                }
            },
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={
            "error": {
                "code": "ADMIN_NOT_CONFIGURED",
                "message": "管理员鉴权会在 Phase 5 接入 Supabase Auth 后启用",
            }
        },
    )

