from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import not_found
from app.db.models.content import TimelineEvent
from app.db.models.enums import TimelineType, Visibility
from app.modules.timeline.schemas import (
    AdminTimelineCreate,
    AdminTimelineItem,
    AdminTimelineUpdate,
    TimelineEventSchema,
)


def _public(event: TimelineEvent) -> TimelineEventSchema:
    return TimelineEventSchema(
        id=str(event.id),
        date=event.event_date,
        type=event.type.value,
        title=event.title,
        description=event.description,
        url=event.url,
        is_featured=event.is_featured,
    )


def _admin(event: TimelineEvent) -> AdminTimelineItem:
    return AdminTimelineItem(
        **_public(event).model_dump(by_alias=False),
        visibility=event.visibility.value,
        sort_order=event.sort_order,
        updated_at=event.updated_at,
    )


async def list_public(
    session: AsyncSession, *, type_filter: TimelineType | None
) -> list[TimelineEventSchema]:
    stmt = (
        select(TimelineEvent)
        .where(TimelineEvent.visibility == Visibility.public)
        .order_by(TimelineEvent.event_date.desc(), TimelineEvent.sort_order.asc())
    )
    if type_filter is not None:
        stmt = stmt.where(TimelineEvent.type == type_filter)
    return [_public(event) for event in (await session.scalars(stmt)).all()]


async def admin_list(session: AsyncSession) -> list[AdminTimelineItem]:
    stmt = select(TimelineEvent).order_by(TimelineEvent.event_date.desc())
    return [_admin(event) for event in (await session.scalars(stmt)).all()]


async def create(session: AsyncSession, payload: AdminTimelineCreate) -> AdminTimelineItem:
    event = TimelineEvent(
        event_date=payload.date,
        type=payload.type,
        title=payload.title,
        description=payload.description,
        url=payload.url,
        visibility=payload.visibility,
        is_featured=payload.is_featured,
        sort_order=payload.sort_order,
    )
    session.add(event)
    await session.commit()
    await session.refresh(event)
    return _admin(event)


async def update(
    session: AsyncSession, event_id: str, payload: AdminTimelineUpdate
) -> AdminTimelineItem:
    event = await session.get(TimelineEvent, UUID(event_id))
    if event is None:
        raise not_found("动态不存在")
    data = payload.model_dump(exclude_unset=True)
    if data.get("date") is not None:
        event.event_date = data["date"]
    for field in ("type", "title", "visibility", "is_featured", "sort_order"):
        if field in data and data[field] is not None:
            setattr(event, field, data[field])
    if "description" in data:
        event.description = data["description"]
    if "url" in data:
        event.url = data["url"]
    session.add(event)
    await session.commit()
    await session.refresh(event)
    return _admin(event)


async def delete(session: AsyncSession, event_id: str) -> None:
    event = await session.get(TimelineEvent, UUID(event_id))
    if event is None:
        raise not_found("动态不存在")
    await session.delete(event)
    await session.commit()
