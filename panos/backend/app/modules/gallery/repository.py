from uuid import UUID

from sqlalchemy import Row, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.content import Category, GalleryItem, MediaAsset
from app.db.models.enums import ContentStatus, Visibility

# 公开查询带出的列：GalleryItem + 媒体 + 分类名/slug（outerjoin 时运行时可能为 None）
PublicRow = Row[tuple[GalleryItem, MediaAsset, str, str]]

_PUBLIC = (
    GalleryItem.status == ContentStatus.published,
    GalleryItem.visibility == Visibility.public,
)


async def list_public(
    session: AsyncSession, *, category: str | None, page: int, page_size: int
) -> tuple[list[PublicRow], int]:
    stmt = (
        select(GalleryItem, MediaAsset, Category.name, Category.slug)
        .join(MediaAsset, GalleryItem.media_asset_id == MediaAsset.id)
        .outerjoin(Category, GalleryItem.category_id == Category.id)
        .where(*_PUBLIC)
        .order_by(GalleryItem.sort_order.asc(), GalleryItem.created_at.desc())
    )
    count_stmt = (
        select(func.count())
        .select_from(GalleryItem)
        .outerjoin(Category, GalleryItem.category_id == Category.id)
        .where(*_PUBLIC)
    )
    if category:
        stmt = stmt.where(Category.slug == category)
        count_stmt = count_stmt.where(Category.slug == category)

    total = await session.scalar(count_stmt) or 0
    result = await session.execute(stmt.offset((page - 1) * page_size).limit(page_size))
    return list(result.all()), total


async def get_by_slug(session: AsyncSession, slug: str) -> GalleryItem | None:
    item: GalleryItem | None = await session.scalar(
        select(GalleryItem).where(GalleryItem.slug == slug)
    )
    return item


async def admin_list(
    session: AsyncSession, *, page: int, page_size: int
) -> tuple[list[Row[tuple[GalleryItem, str | None]]], int]:
    stmt = (
        select(GalleryItem, MediaAsset.public_url)
        .join(MediaAsset, GalleryItem.media_asset_id == MediaAsset.id)
        .order_by(GalleryItem.updated_at.desc())
    )
    count_stmt = select(func.count()).select_from(GalleryItem)
    total = await session.scalar(count_stmt) or 0
    result = await session.execute(stmt.offset((page - 1) * page_size).limit(page_size))
    return list(result.all()), total


async def admin_get(session: AsyncSession, item_id: str) -> GalleryItem | None:
    return await session.get(GalleryItem, UUID(item_id))


async def get_media_url(session: AsyncSession, media_asset_id: UUID) -> str | None:
    return await session.scalar(
        select(MediaAsset.public_url).where(MediaAsset.id == media_asset_id)
    )


async def persist(session: AsyncSession, item: GalleryItem) -> GalleryItem:
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item


async def remove(session: AsyncSession, item: GalleryItem) -> None:
    await session.delete(item)
    await session.commit()
