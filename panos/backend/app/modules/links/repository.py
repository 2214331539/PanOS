from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.content import SocialLink


async def list_active(session: AsyncSession) -> list[SocialLink]:
    stmt = (
        select(SocialLink)
        .where(SocialLink.is_active.is_(True))
        .order_by(SocialLink.sort_order.asc(), SocialLink.created_at.asc())
    )
    return list((await session.scalars(stmt)).all())


async def admin_list(session: AsyncSession) -> list[SocialLink]:
    stmt = select(SocialLink).order_by(SocialLink.sort_order.asc(), SocialLink.created_at.asc())
    return list((await session.scalars(stmt)).all())


async def get_by_slug(session: AsyncSession, slug: str) -> SocialLink | None:
    link: SocialLink | None = await session.scalar(
        select(SocialLink).where(SocialLink.slug == slug)
    )
    return link


async def admin_get(session: AsyncSession, link_id: str) -> SocialLink | None:
    return await session.get(SocialLink, UUID(link_id))


async def persist(session: AsyncSession, link: SocialLink) -> SocialLink:
    session.add(link)
    await session.commit()
    await session.refresh(link)
    return link


async def remove(session: AsyncSession, link: SocialLink) -> None:
    await session.delete(link)
    await session.commit()
