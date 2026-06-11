from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.content import Widget


async def list_enabled(session: AsyncSession) -> list[Widget]:
    stmt = (
        select(Widget)
        .where(Widget.is_enabled.is_(True))
        .order_by(Widget.sort_order.asc(), Widget.created_at.asc())
    )
    return list((await session.scalars(stmt)).all())


async def admin_list(session: AsyncSession) -> list[Widget]:
    stmt = select(Widget).order_by(Widget.sort_order.asc(), Widget.created_at.asc())
    return list((await session.scalars(stmt)).all())


async def admin_get(session: AsyncSession, widget_id: str) -> Widget | None:
    return await session.get(Widget, UUID(widget_id))


async def persist(session: AsyncSession, widget: Widget) -> Widget:
    session.add(widget)
    await session.commit()
    await session.refresh(widget)
    return widget


async def remove(session: AsyncSession, widget: Widget) -> None:
    await session.delete(widget)
    await session.commit()
