from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import api_error, not_found
from app.db.models.content import CalendarEvent
from app.modules.calendar import repository as repo
from app.modules.calendar.schemas import (
    CalendarEventCreate,
    CalendarEventSchema,
    CalendarEventUpdate,
)


def _schema(event: CalendarEvent) -> CalendarEventSchema:
    return CalendarEventSchema(id=str(event.id), date=event.event_date, title=event.title)


def month_range(month: str) -> tuple[date, date]:
    """'YYYY-MM' → [当月 1 号, 下月 1 号)。格式非法时报 422。"""
    try:
        year_str, month_str = month.split("-")
        start = date(int(year_str), int(month_str), 1)
    except ValueError as exc:
        raise api_error(422, "INVALID_MONTH", "month 需为 YYYY-MM 格式") from exc
    end = date(start.year + 1, 1, 1) if start.month == 12 else date(start.year, start.month + 1, 1)
    return start, end


async def list_month(session: AsyncSession, month: str) -> list[CalendarEventSchema]:
    start, end = month_range(month)
    return [_schema(event) for event in await repo.list_between(session, start=start, end=end)]


async def create_event(
    session: AsyncSession, payload: CalendarEventCreate
) -> CalendarEventSchema:
    event = await repo.persist(
        session, CalendarEvent(event_date=payload.date, title=payload.title)
    )
    return _schema(event)


async def update_event(
    session: AsyncSession, event_id: str, payload: CalendarEventUpdate
) -> CalendarEventSchema:
    event = await repo.get(session, event_id)
    if event is None:
        raise not_found("计划不存在")
    data = payload.model_dump(exclude_unset=True)
    if data.get("date") is not None:
        event.event_date = data["date"]
    if data.get("title") is not None:
        event.title = data["title"]
    await repo.persist(session, event)
    return _schema(event)


async def delete_event(session: AsyncSession, event_id: str) -> None:
    event = await repo.get(session, event_id)
    if event is None:
        raise not_found("计划不存在")
    await repo.remove(session, event)
