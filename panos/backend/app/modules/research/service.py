from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import not_found, slug_conflict
from app.core.text import slugify
from app.db.models.content import ResearchNote
from app.db.models.enums import ContentStatus, Visibility
from app.modules.research.schemas import (
    AdminResearchCreate,
    AdminResearchItem,
    AdminResearchUpdate,
    ResearchCardSchema,
    ResearchDetailSchema,
)

_PUBLIC = (
    ResearchNote.status == ContentStatus.published,
    ResearchNote.visibility == Visibility.public,
)


def _card(note: ResearchNote) -> ResearchCardSchema:
    return ResearchCardSchema(
        id=str(note.id),
        slug=note.slug,
        title=note.title,
        excerpt=note.excerpt,
        progress=note.progress,
        started_at=note.started_at,
        published_at=note.published_at,
    )


def _admin(note: ResearchNote) -> AdminResearchItem:
    return AdminResearchItem(
        **_card(note).model_dump(by_alias=False),
        status=note.status.value,
        visibility=note.visibility.value,
        updated_at=note.updated_at,
    )


async def _by_slug(session: AsyncSession, slug: str) -> ResearchNote | None:
    note: ResearchNote | None = await session.scalar(
        select(ResearchNote).where(ResearchNote.slug == slug)
    )
    return note


async def list_public(session: AsyncSession) -> list[ResearchCardSchema]:
    stmt = select(ResearchNote).where(*_PUBLIC).order_by(ResearchNote.published_at.desc())
    return [_card(note) for note in (await session.scalars(stmt)).all()]


async def get_public(session: AsyncSession, slug: str) -> ResearchDetailSchema:
    note = await session.scalar(
        select(ResearchNote).where(*_PUBLIC, ResearchNote.slug == slug)
    )
    if note is None:
        raise not_found("研究笔记不存在")
    return ResearchDetailSchema(
        **_card(note).model_dump(by_alias=False), body_mdx=note.body_mdx
    )


async def admin_list(session: AsyncSession) -> list[AdminResearchItem]:
    stmt = select(ResearchNote).order_by(ResearchNote.updated_at.desc())
    return [_admin(note) for note in (await session.scalars(stmt)).all()]


async def create(session: AsyncSession, payload: AdminResearchCreate) -> AdminResearchItem:
    slug = payload.slug or slugify(payload.title)
    if await _by_slug(session, slug) is not None:
        raise slug_conflict(slug)
    note = ResearchNote(
        slug=slug,
        title=payload.title,
        excerpt=payload.excerpt,
        body_mdx=payload.body_mdx,
        status=payload.status,
        visibility=payload.visibility,
        progress=payload.progress,
        started_at=payload.started_at,
        published_at=datetime.now(UTC) if payload.status == ContentStatus.published else None,
    )
    session.add(note)
    await session.commit()
    await session.refresh(note)
    return _admin(note)


async def update(
    session: AsyncSession, note_id: str, payload: AdminResearchUpdate
) -> AdminResearchItem:
    note = await session.get(ResearchNote, UUID(note_id))
    if note is None:
        raise not_found("研究笔记不存在")
    data = payload.model_dump(exclude_unset=True)

    new_slug = data.get("slug")
    if new_slug and new_slug != note.slug and await _by_slug(session, new_slug):
        raise slug_conflict(new_slug)

    for field in ("title", "slug", "excerpt", "body_mdx", "visibility"):
        if field in data and data[field] is not None:
            setattr(note, field, data[field])
    if "progress" in data:
        note.progress = data["progress"]
    if "started_at" in data:
        note.started_at = data["started_at"]
    if data.get("status") is not None:
        note.status = data["status"]
        if data["status"] == ContentStatus.published and note.published_at is None:
            note.published_at = datetime.now(UTC)

    session.add(note)
    await session.commit()
    await session.refresh(note)
    return _admin(note)


async def delete(session: AsyncSession, note_id: str) -> None:
    note = await session.get(ResearchNote, UUID(note_id))
    if note is None:
        raise not_found("研究笔记不存在")
    await session.delete(note)
    await session.commit()
