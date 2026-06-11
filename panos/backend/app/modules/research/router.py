from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import apply_no_store, apply_public_cache
from app.core.security import require_admin_user
from app.db.session import get_session
from app.modules.research import service
from app.modules.research.schemas import (
    AdminResearchCreate,
    AdminResearchItem,
    AdminResearchUpdate,
    ResearchCardSchema,
    ResearchDetailSchema,
)
from app.schemas.responses import DataEnvelope

public_router = APIRouter(prefix="/research", tags=["research"])
admin_router = APIRouter(
    dependencies=[Depends(require_admin_user)], prefix="/admin/research", tags=["admin"]
)


@public_router.get("", response_model=DataEnvelope[list[ResearchCardSchema]])
async def list_research(
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[ResearchCardSchema]]:
    data = await service.list_public(session)
    apply_public_cache(response, "research:" + ",".join(item.id for item in data))
    return DataEnvelope(data=data)


@public_router.get("/{slug}", response_model=DataEnvelope[ResearchDetailSchema])
async def get_research(
    slug: str,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[ResearchDetailSchema]:
    data = await service.get_public(session, slug)
    apply_public_cache(response, f"research:{slug}:{data.published_at}")
    return DataEnvelope(data=data)


@admin_router.get("", response_model=DataEnvelope[list[AdminResearchItem]])
async def admin_list_research(
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[AdminResearchItem]]:
    apply_no_store(response)
    return DataEnvelope(data=await service.admin_list(session))


@admin_router.post(
    "", response_model=DataEnvelope[AdminResearchItem], status_code=status.HTTP_201_CREATED
)
async def admin_create_research(
    payload: AdminResearchCreate,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminResearchItem]:
    return DataEnvelope(data=await service.create(session, payload))


@admin_router.patch("/{note_id}", response_model=DataEnvelope[AdminResearchItem])
async def admin_update_research(
    note_id: str,
    payload: AdminResearchUpdate,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminResearchItem]:
    return DataEnvelope(data=await service.update(session, note_id, payload))


@admin_router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_research(
    note_id: str,
    session: AsyncSession = Depends(get_session),
) -> None:
    await service.delete(session, note_id)


router = APIRouter()
router.include_router(public_router)
router.include_router(admin_router)
