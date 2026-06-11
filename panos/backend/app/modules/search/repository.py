from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.content import Article, GalleryItem, Project, SocialLink
from app.db.models.enums import ContentStatus, Visibility


def _pattern(query: str) -> str:
    # 转义 LIKE 通配符，按"包含"匹配。
    escaped = query.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{escaped}%"


async def search_articles(session: AsyncSession, query: str, limit: int) -> list[Article]:
    pattern = _pattern(query)
    stmt = (
        select(Article)
        .where(
            Article.status == ContentStatus.published,
            Article.visibility == Visibility.public,
            or_(Article.title.ilike(pattern), Article.excerpt.ilike(pattern)),
        )
        .order_by(Article.published_at.desc())
        .limit(limit)
    )
    return list((await session.scalars(stmt)).all())


async def search_projects(session: AsyncSession, query: str, limit: int) -> list[Project]:
    pattern = _pattern(query)
    stmt = (
        select(Project)
        .where(
            Project.visibility == Visibility.public,
            or_(
                Project.name.ilike(pattern),
                Project.tagline.ilike(pattern),
                Project.summary.ilike(pattern),
            ),
        )
        .order_by(Project.is_featured.desc(), Project.sort_order.asc())
        .limit(limit)
    )
    return list((await session.scalars(stmt)).all())


async def search_gallery(session: AsyncSession, query: str, limit: int) -> list[GalleryItem]:
    pattern = _pattern(query)
    stmt = (
        select(GalleryItem)
        .where(
            GalleryItem.status == ContentStatus.published,
            GalleryItem.visibility == Visibility.public,
            or_(GalleryItem.title.ilike(pattern), GalleryItem.description.ilike(pattern)),
        )
        .order_by(GalleryItem.sort_order.asc())
        .limit(limit)
    )
    return list((await session.scalars(stmt)).all())


async def search_links(session: AsyncSession, query: str, limit: int) -> list[SocialLink]:
    pattern = _pattern(query)
    stmt = (
        select(SocialLink)
        .where(
            SocialLink.is_active.is_(True),
            or_(SocialLink.platform.ilike(pattern), SocialLink.description.ilike(pattern)),
        )
        .order_by(SocialLink.sort_order.asc())
        .limit(limit)
    )
    return list((await session.scalars(stmt)).all())
