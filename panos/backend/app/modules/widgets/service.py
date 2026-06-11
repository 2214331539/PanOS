from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import not_found
from app.db.models.content import Widget
from app.modules.widgets import repository as repo
from app.modules.widgets.schemas import (
    AdminWidgetCreate,
    AdminWidgetItem,
    AdminWidgetUpdate,
    PublicWidgetSchema,
)


def _public(widget: Widget) -> PublicWidgetSchema:
    return PublicWidgetSchema(
        id=str(widget.id), type=widget.type, title=widget.title, payload=widget.payload
    )


def _admin_item(widget: Widget) -> AdminWidgetItem:
    return AdminWidgetItem(
        id=str(widget.id),
        type=widget.type,
        title=widget.title,
        payload=widget.payload,
        is_enabled=widget.is_enabled,
        sort_order=widget.sort_order,
        updated_at=widget.updated_at,
    )


# ---- 公开 ----
async def list_public_widgets(session: AsyncSession) -> list[PublicWidgetSchema]:
    return [_public(widget) for widget in await repo.list_enabled(session)]


# ---- 后台 ----
async def admin_list_widgets(session: AsyncSession) -> list[AdminWidgetItem]:
    return [_admin_item(widget) for widget in await repo.admin_list(session)]


async def create_widget(session: AsyncSession, payload: AdminWidgetCreate) -> AdminWidgetItem:
    widget = Widget(
        type=payload.type,
        title=payload.title,
        payload=payload.payload,
        is_enabled=payload.is_enabled,
        sort_order=payload.sort_order,
    )
    await repo.persist(session, widget)
    return _admin_item(widget)


async def update_widget(
    session: AsyncSession, widget_id: str, payload: AdminWidgetUpdate
) -> AdminWidgetItem:
    widget = await repo.admin_get(session, widget_id)
    if widget is None:
        raise not_found("Widget 不存在")
    data = payload.model_dump(exclude_unset=True)
    for field in ("type", "title", "payload", "is_enabled", "sort_order"):
        if field in data and data[field] is not None:
            setattr(widget, field, data[field])
    await repo.persist(session, widget)
    return _admin_item(widget)


async def delete_widget(session: AsyncSession, widget_id: str) -> None:
    widget = await repo.admin_get(session, widget_id)
    if widget is None:
        raise not_found("Widget 不存在")
    await repo.remove(session, widget)
