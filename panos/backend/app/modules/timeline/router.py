from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import apply_no_store, apply_public_cache
from app.core.security import require_admin_user
from app.db.models.enums import TimelineType
from app.db.session import get_session
from app.modules.timeline import service
from app.modules.timeline.schemas import (
    AdminTimelineCreate,
    AdminTimelineItem,
    AdminTimelineUpdate,
    TimelineEventSchema,
)
from app.schemas.responses import DataEnvelope

public_router = APIRouter(prefix="/timeline", tags=["timeline"])
admin_router = APIRouter(
    dependencies=[Depends(require_admin_user)], prefix="/admin/timeline", tags=["admin"]
)


@public_router.get("", response_model=DataEnvelope[list[TimelineEventSchema]])
async def list_timeline(
    response: Response,
    type_filter: TimelineType | None = Query(default=None, alias="type"),
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[TimelineEventSchema]]:
    data = await service.list_public(session, type_filter=type_filter)
    apply_public_cache(
        response, f"timeline:{type_filter}:" + ",".join(item.id for item in data)
    )
    return DataEnvelope(data=data)


@admin_router.get("", response_model=DataEnvelope[list[AdminTimelineItem]])
async def admin_list_timeline(
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[AdminTimelineItem]]:
    apply_no_store(response)
    return DataEnvelope(data=await service.admin_list(session))


@admin_router.post(
    "", response_model=DataEnvelope[AdminTimelineItem], status_code=status.HTTP_201_CREATED
)
async def admin_create_timeline(
    payload: AdminTimelineCreate,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminTimelineItem]:
    return DataEnvelope(data=await service.create(session, payload))


@admin_router.patch("/{event_id}", response_model=DataEnvelope[AdminTimelineItem])
async def admin_update_timeline(
    event_id: str,
    payload: AdminTimelineUpdate,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminTimelineItem]:
    return DataEnvelope(data=await service.update(session, event_id, payload))


@admin_router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_timeline(
    event_id: str,
    session: AsyncSession = Depends(get_session),
) -> None:
    await service.delete(session, event_id)


router = APIRouter()
router.include_router(public_router)
router.include_router(admin_router)
