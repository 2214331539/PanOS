from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import apply_no_store, apply_public_cache
from app.core.security import AdminPrincipal, require_admin_user
from app.db.session import get_session
from app.modules.links import service
from app.modules.links.schemas import (
    AdminLinkCreate,
    AdminLinkItem,
    AdminLinkUpdate,
    PublicLinkSchema,
)
from app.schemas.responses import DataEnvelope

public_router = APIRouter(prefix="/links", tags=["links"])
admin_router = APIRouter(prefix="/admin/links", tags=["admin"])


@public_router.get("", response_model=DataEnvelope[list[PublicLinkSchema]])
async def links(
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[PublicLinkSchema]]:
    data = await service.list_public_links(session)
    apply_public_cache(response, "links:" + str([item.model_dump() for item in data]))
    return DataEnvelope(data=data)


@admin_router.get("", response_model=DataEnvelope[list[AdminLinkItem]])
async def admin_list_links(
    response: Response,
    _: AdminPrincipal = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[AdminLinkItem]]:
    apply_no_store(response)
    return DataEnvelope(data=await service.admin_list_links(session))


@admin_router.post(
    "", response_model=DataEnvelope[AdminLinkItem], status_code=status.HTTP_201_CREATED
)
async def admin_create_link(
    payload: AdminLinkCreate,
    _: AdminPrincipal = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminLinkItem]:
    return DataEnvelope(data=await service.create_link(session, payload))


@admin_router.patch("/{link_id}", response_model=DataEnvelope[AdminLinkItem])
async def admin_update_link(
    link_id: str,
    payload: AdminLinkUpdate,
    _: AdminPrincipal = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminLinkItem]:
    return DataEnvelope(data=await service.update_link(session, link_id, payload))


@admin_router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_link(
    link_id: str,
    _: AdminPrincipal = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    await service.delete_link(session, link_id)


router = APIRouter()
router.include_router(public_router)
router.include_router(admin_router)
