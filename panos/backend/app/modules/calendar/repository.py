from datetime import date
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.content import CalendarEvent


async def list_between(
    session: AsyncSession, *, start: date, end: date
) -> list[CalendarEvent]:
    stmt = (
        select(CalendarEvent)
        .where(CalendarEvent.event_date >= start, CalendarEvent.event_date < end)
        .order_by(CalendarEvent.event_date.asc(), CalendarEvent.created_at.asc())
    )
    return list((await session.scalars(stmt)).all())


async def get(session: AsyncSession, event_id: str) -> CalendarEvent | None:
    return await session.get(CalendarEvent, UUID(event_id))


async def persist(session: AsyncSession, event: CalendarEvent) -> CalendarEvent:
    session.add(event)
    await session.commit()
    await session.refresh(event)
    return event


async def remove(session: AsyncSession, event: CalendarEvent) -> None:
    await session.delete(event)
    await session.commit()
