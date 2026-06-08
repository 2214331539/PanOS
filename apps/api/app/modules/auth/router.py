from fastapi import APIRouter, Depends

from app.core.security import AdminPrincipal, require_admin_user
from app.modules.auth.schemas import AdminMe
from app.schemas.responses import DataEnvelope

router = APIRouter(prefix="/admin", tags=["admin"])


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
