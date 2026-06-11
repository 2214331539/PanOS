from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import apply_no_store, apply_public_cache
from app.core.security import require_admin_user
from app.db.session import get_session
from app.modules.ideas import service
from app.modules.ideas.schemas import (
    AdminIdeaCreate,
    AdminIdeaItem,
    AdminIdeaUpdate,
    IdeaSchema,
)
from app.schemas.responses import DataEnvelope

public_router = APIRouter(prefix="/ideas", tags=["ideas"])
admin_router = APIRouter(
    dependencies=[Depends(require_admin_user)], prefix="/admin/ideas", tags=["admin"]
)


@public_router.get("", response_model=DataEnvelope[list[IdeaSchema]])
async def list_ideas(
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[IdeaSchema]]:
    data = await service.list_public(session)
    apply_public_cache(response, "ideas:" + ",".join(item.id for item in data))
    return DataEnvelope(data=data)


@admin_router.get("", response_model=DataEnvelope[list[AdminIdeaItem]])
async def admin_list_ideas(
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[AdminIdeaItem]]:
    apply_no_store(response)
    return DataEnvelope(data=await service.admin_list(session))


@admin_router.post(
    "", response_model=DataEnvelope[AdminIdeaItem], status_code=status.HTTP_201_CREATED
)
async def admin_create_idea(
    payload: AdminIdeaCreate,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminIdeaItem]:
    return DataEnvelope(data=await service.create(session, payload))


@admin_router.patch("/{idea_id}", response_model=DataEnvelope[AdminIdeaItem])
async def admin_update_idea(
    idea_id: str,
    payload: AdminIdeaUpdate,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminIdeaItem]:
    return DataEnvelope(data=await service.update(session, idea_id, payload))


@admin_router.delete("/{idea_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_idea(
    idea_id: str,
    session: AsyncSession = Depends(get_session),
) -> None:
    await service.delete(session, idea_id)


router = APIRouter()
router.include_router(public_router)
router.include_router(admin_router)
