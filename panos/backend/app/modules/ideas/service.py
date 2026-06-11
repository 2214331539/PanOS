from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import not_found
from app.db.models.content import Idea
from app.db.models.enums import Visibility
from app.modules.ideas.schemas import (
    AdminIdeaCreate,
    AdminIdeaItem,
    AdminIdeaUpdate,
    IdeaSchema,
)


def _public(idea: Idea) -> IdeaSchema:
    return IdeaSchema(
        id=str(idea.id),
        title=idea.title,
        summary=idea.summary,
        body_mdx=idea.body_mdx,
        status=idea.status.value,
        source=idea.source,
        is_featured=idea.is_featured,
        created_at=idea.created_at,
    )


def _admin(idea: Idea) -> AdminIdeaItem:
    return AdminIdeaItem(
        **_public(idea).model_dump(by_alias=False),
        visibility=idea.visibility.value,
        updated_at=idea.updated_at,
    )


async def list_public(session: AsyncSession) -> list[IdeaSchema]:
    stmt = (
        select(Idea)
        .where(Idea.visibility == Visibility.public)
        .order_by(Idea.is_featured.desc(), Idea.created_at.desc())
    )
    return [_public(idea) for idea in (await session.scalars(stmt)).all()]


async def admin_list(session: AsyncSession) -> list[AdminIdeaItem]:
    stmt = select(Idea).order_by(Idea.updated_at.desc())
    return [_admin(idea) for idea in (await session.scalars(stmt)).all()]


async def create(session: AsyncSession, payload: AdminIdeaCreate) -> AdminIdeaItem:
    idea = Idea(**payload.model_dump())
    session.add(idea)
    await session.commit()
    await session.refresh(idea)
    return _admin(idea)


async def update(session: AsyncSession, idea_id: str, payload: AdminIdeaUpdate) -> AdminIdeaItem:
    idea = await session.get(Idea, UUID(idea_id))
    if idea is None:
        raise not_found("想法不存在")
    data = payload.model_dump(exclude_unset=True)
    for field in ("title", "summary", "status", "visibility", "is_featured"):
        if field in data and data[field] is not None:
            setattr(idea, field, data[field])
    if "body_mdx" in data:
        idea.body_mdx = data["body_mdx"]
    if "source" in data:
        idea.source = data["source"]
    session.add(idea)
    await session.commit()
    await session.refresh(idea)
    return _admin(idea)


async def delete(session: AsyncSession, idea_id: str) -> None:
    idea = await session.get(Idea, UUID(idea_id))
    if idea is None:
        raise not_found("想法不存在")
    await session.delete(idea)
    await session.commit()
