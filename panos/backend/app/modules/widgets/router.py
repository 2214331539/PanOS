from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import apply_no_store, apply_public_cache
from app.core.security import require_admin_user
from app.db.session import get_session
from app.modules.widgets import service
from app.modules.widgets.schemas import (
    AdminWidgetCreate,
    AdminWidgetItem,
    AdminWidgetUpdate,
    PublicWidgetSchema,
)
from app.schemas.responses import DataEnvelope

public_router = APIRouter(prefix="/widgets", tags=["widgets"])
admin_router = APIRouter(
    dependencies=[Depends(require_admin_user)], prefix="/admin/widgets", tags=["admin"]
)


@public_router.get("", response_model=DataEnvelope[list[PublicWidgetSchema]])
async def widgets(
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[PublicWidgetSchema]]:
    data = await service.list_public_widgets(session)
    apply_public_cache(response, "widgets:" + str([item.model_dump() for item in data]))
    return DataEnvelope(data=data)


@admin_router.get("", response_model=DataEnvelope[list[AdminWidgetItem]])
async def admin_list_widgets(
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[AdminWidgetItem]]:
    apply_no_store(response)
    return DataEnvelope(data=await service.admin_list_widgets(session))


@admin_router.post(
    "", response_model=DataEnvelope[AdminWidgetItem], status_code=status.HTTP_201_CREATED
)
async def admin_create_widget(
    payload: AdminWidgetCreate,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminWidgetItem]:
    return DataEnvelope(data=await service.create_widget(session, payload))


@admin_router.patch("/{widget_id}", response_model=DataEnvelope[AdminWidgetItem])
async def admin_update_widget(
    widget_id: str,
    payload: AdminWidgetUpdate,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminWidgetItem]:
    return DataEnvelope(data=await service.update_widget(session, widget_id, payload))


@admin_router.delete("/{widget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_widget(
    widget_id: str,
    session: AsyncSession = Depends(get_session),
) -> None:
    await service.delete_widget(session, widget_id)


router = APIRouter()
router.include_router(public_router)
router.include_router(admin_router)
