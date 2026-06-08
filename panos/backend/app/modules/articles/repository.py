from datetime import datetime
from uuid import UUID

from sqlalchemy import Row, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.content import Article, Category, MediaAsset
from app.db.models.enums import ContentStatus, Visibility

# 公开查询带出的列：Article + 分类名/slug + 封面 url/alt
PublicRow = Row[tuple[Article, str, str, str | None, str | None]]
NavRow = Row[tuple[str, str]]

_PUBLISHED = (
    Article.status == ContentStatus.published,
    Article.visibility == Visibility.public,
)


async def list_published(
    session: AsyncSession, *, category: str | None, page: int, page_size: int
) -> tuple[list[PublicRow], int]:
    stmt = (
        select(Article, Category.name, Category.slug, MediaAsset.public_url, MediaAsset.alt)
        .outerjoin(Category, Article.category_id == Category.id)
        .outerjoin(MediaAsset, Article.cover_media_id == MediaAsset.id)
        .where(*_PUBLISHED)
        .order_by(Article.published_at.desc())
    )
    count_stmt = (
        select(func.count())
        .select_from(Article)
        .outerjoin(Category, Article.category_id == Category.id)
        .where(*_PUBLISHED)
    )
    if category:
        stmt = stmt.where(Category.slug == category)
        count_stmt = count_stmt.where(Category.slug == category)

    total = await session.scalar(count_stmt) or 0
    result = await session.execute(stmt.offset((page - 1) * page_size).limit(page_size))
    return list(result.all()), total


async def get_published_by_slug(session: AsyncSession, slug: str) -> PublicRow | None:
    stmt = (
        select(Article, Category.name, Category.slug, MediaAsset.public_url, MediaAsset.alt)
        .outerjoin(Category, Article.category_id == Category.id)
        .outerjoin(MediaAsset, Article.cover_media_id == MediaAsset.id)
        .where(*_PUBLISHED, Article.slug == slug)
    )
    return (await session.execute(stmt)).first()


async def get_adjacent(
    session: AsyncSession, published_at: datetime
) -> tuple[NavRow | None, NavRow | None]:
    base = select(Article.slug, Article.title).where(*_PUBLISHED, Article.published_at.is_not(None))
    previous = (
        await session.execute(
            base.where(Article.published_at < published_at)
            .order_by(Article.published_at.desc())
            .limit(1)
        )
    ).first()
    nxt = (
        await session.execute(
            base.where(Article.published_at > published_at)
            .order_by(Article.published_at.asc())
            .limit(1)
        )
    ).first()
    return previous, nxt


async def get_by_slug(session: AsyncSession, slug: str) -> Article | None:
    article: Article | None = await session.scalar(select(Article).where(Article.slug == slug))
    return article


async def admin_list(
    session: AsyncSession, *, status: ContentStatus | None, page: int, page_size: int
) -> tuple[list[Article], int]:
    stmt = select(Article).order_by(Article.updated_at.desc())
    count_stmt = select(func.count()).select_from(Article)
    if status is not None:
        stmt = stmt.where(Article.status == status)
        count_stmt = count_stmt.where(Article.status == status)
    total = await session.scalar(count_stmt) or 0
    result = await session.scalars(stmt.offset((page - 1) * page_size).limit(page_size))
    return list(result.all()), total


async def admin_get(session: AsyncSession, article_id: str) -> Article | None:
    return await session.get(Article, UUID(article_id))


async def persist(session: AsyncSession, article: Article) -> Article:
    session.add(article)
    await session.commit()
    await session.refresh(article)
    return article
