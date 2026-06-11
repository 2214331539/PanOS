from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import apply_no_store, apply_public_cache
from app.core.security import require_admin_user
from app.db.session import get_session
from app.modules.calendar import service
from app.modules.calendar.schemas import (
    CalendarEventCreate,
    CalendarEventSchema,
    CalendarEventUpdate,
)
from app.schemas.responses import DataEnvelope

public_router = APIRouter(prefix="/calendar", tags=["calendar"])
admin_router = APIRouter(
    dependencies=[Depends(require_admin_user)], prefix="/admin/calendar", tags=["admin"]
)


@public_router.get("", response_model=DataEnvelope[list[CalendarEventSchema]])
async def list_month(
    response: Response,
    month: str = Query(pattern=r"^\d{4}-\d{2}$", description="YYYY-MM"),
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[CalendarEventSchema]]:
    data = await service.list_month(session, month)
    apply_public_cache(
        response, "calendar:" + month + ":" + ",".join(item.id for item in data), max_age=30
    )
    return DataEnvelope(data=data)


@admin_router.post(
    "", response_model=DataEnvelope[CalendarEventSchema], status_code=status.HTTP_201_CREATED
)
async def admin_create_event(
    payload: CalendarEventCreate,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[CalendarEventSchema]:
    apply_no_store(response)
    return DataEnvelope(data=await service.create_event(session, payload))


@admin_router.patch("/{event_id}", response_model=DataEnvelope[CalendarEventSchema])
async def admin_update_event(
    event_id: str,
    payload: CalendarEventUpdate,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[CalendarEventSchema]:
    return DataEnvelope(data=await service.update_event(session, event_id, payload))


@admin_router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_event(
    event_id: str,
    session: AsyncSession = Depends(get_session),
) -> None:
    await service.delete_event(session, event_id)


router = APIRouter()
router.include_router(public_router)
router.include_router(admin_router)
