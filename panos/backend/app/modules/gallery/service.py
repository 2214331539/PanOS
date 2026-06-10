import re
from uuid import UUID, uuid4

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.content import GalleryItem, MediaAsset
from app.modules.gallery import repository as repo
from app.modules.gallery.schemas import (
    AdminGalleryCreate,
    AdminGalleryDetail,
    AdminGalleryListItem,
    AdminGalleryUpdate,
    CategoryRefSchema,
    GalleryItemSchema,
    GalleryMediaSchema,
)


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or uuid4().hex[:8]


def _conflict(message: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail={"error": {"code": "SLUG_CONFLICT", "message": message}},
    )


def _not_found() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"error": {"code": "NOT_FOUND", "message": "图片不存在"}},
    )


def _public_item(
    item: GalleryItem, media: MediaAsset, cat_name: str | None, cat_slug: str | None
) -> GalleryItemSchema:
    return GalleryItemSchema(
        id=str(item.id),
        slug=item.slug,
        title=item.title,
        description=item.description,
        category=CategoryRefSchema(name=cat_name, slug=cat_slug) if cat_name and cat_slug else None,
        media=GalleryMediaSchema(
            url=media.public_url or "",
            width=media.width,
            height=media.height,
            alt=media.alt or item.title,
        ),
        tool=item.tool,
        shot_at=item.shot_at,
        allow_download=item.allow_download,
    )


def _admin_detail(item: GalleryItem, media_url: str | None) -> AdminGalleryDetail:
    return AdminGalleryDetail(
        id=str(item.id),
        slug=item.slug,
        title=item.title,
        description=item.description,
        category_id=str(item.category_id) if item.category_id else None,
        media_asset_id=str(item.media_asset_id),
        media_url=media_url,
        tool=item.tool,
        shot_at=item.shot_at,
        status=item.status.value,
        visibility=item.visibility.value,
        allow_download=item.allow_download,
        sort_order=item.sort_order,
    )


# ---- 公开 ----
async def list_gallery(
    session: AsyncSession, *, category: str | None, page: int, page_size: int
) -> tuple[list[GalleryItemSchema], int]:
    rows, total = await repo.list_public(
        session, category=category, page=page, page_size=page_size
    )
    return [_public_item(*row) for row in rows], total


# ---- 后台 ----
async def admin_list_gallery(
    session: AsyncSession, *, page: int, page_size: int
) -> tuple[list[AdminGalleryListItem], int]:
    rows, total = await repo.admin_list(session, page=page, page_size=page_size)
    return [
        AdminGalleryListItem(
            id=str(item.id),
            slug=item.slug,
            title=item.title,
            status=item.status.value,
            visibility=item.visibility.value,
            media_url=media_url,
            sort_order=item.sort_order,
            updated_at=item.updated_at,
        )
        for item, media_url in rows
    ], total


async def admin_get_gallery_item(session: AsyncSession, item_id: str) -> AdminGalleryDetail:
    item = await repo.admin_get(session, item_id)
    if item is None:
        raise _not_found()
    media_url = await repo.get_media_url(session, item.media_asset_id)
    return _admin_detail(item, media_url)


async def create_gallery_item(
    session: AsyncSession, payload: AdminGalleryCreate
) -> AdminGalleryDetail:
    slug = payload.slug or _slugify(payload.title)
    if await repo.get_by_slug(session, slug) is not None:
        raise _conflict(f"slug 已存在：{slug}")
    item = GalleryItem(
        slug=slug,
        title=payload.title,
        description=payload.description,
        category_id=UUID(payload.category_id) if payload.category_id else None,
        media_asset_id=UUID(payload.media_asset_id),
        tool=payload.tool,
        shot_at=payload.shot_at,
        status=payload.status,
        visibility=payload.visibility,
        allow_download=payload.allow_download,
        sort_order=payload.sort_order,
    )
    await repo.persist(session, item)
    media_url = await repo.get_media_url(session, item.media_asset_id)
    return _admin_detail(item, media_url)


async def update_gallery_item(
    session: AsyncSession, item_id: str, payload: AdminGalleryUpdate
) -> AdminGalleryDetail:
    item = await repo.admin_get(session, item_id)
    if item is None:
        raise _not_found()
    data = payload.model_dump(exclude_unset=True)

    new_slug = data.get("slug")
    if new_slug and new_slug != item.slug and await repo.get_by_slug(session, new_slug):
        raise _conflict(f"slug 已存在：{new_slug}")

    simple_fields = ("title", "slug", "description", "tool", "allow_download", "sort_order")
    for field in simple_fields:
        if field in data and data[field] is not None:
            setattr(item, field, data[field])
    if "shot_at" in data:
        item.shot_at = data["shot_at"]
    if "category_id" in data:
        item.category_id = UUID(data["category_id"]) if data["category_id"] else None
    if data.get("media_asset_id"):
        item.media_asset_id = UUID(data["media_asset_id"])
    if data.get("status") is not None:
        item.status = data["status"]
    if data.get("visibility") is not None:
        item.visibility = data["visibility"]

    await repo.persist(session, item)
    media_url = await repo.get_media_url(session, item.media_asset_id)
    return _admin_detail(item, media_url)


async def delete_gallery_item(session: AsyncSession, item_id: str) -> None:
    item = await repo.admin_get(session, item_id)
    if item is None:
        raise _not_found()
    await repo.remove(session, item)
