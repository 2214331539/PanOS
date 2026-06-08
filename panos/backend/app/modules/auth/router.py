from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import AdminPrincipal, require_admin_user
from app.modules.auth.schemas import AdminMe, LoginRequest, LoginResult
from app.modules.auth.service import login
from app.schemas.responses import DataEnvelope

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/login", response_model=DataEnvelope[LoginResult])
async def login_route(payload: LoginRequest) -> DataEnvelope[LoginResult]:
    result = login(payload)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "INVALID_CREDENTIALS", "message": "账号或密码错误"}},
        )
    return DataEnvelope(data=result)


@router.get("/me", response_model=DataEnvelope[AdminMe])
async def me(principal: AdminPrincipal = Depends(require_admin_user)) -> DataEnvelope[AdminMe]:
    return DataEnvelope(
        data=AdminMe(
            id=principal.user_id,
            email=principal.email,
            display_name=principal.email,
            role=principal.role,
        )
    )
