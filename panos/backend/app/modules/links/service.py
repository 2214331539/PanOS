import re
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.content import SocialLink
from app.modules.links import repository as repo
from app.modules.links.schemas import (
    AdminLinkCreate,
    AdminLinkItem,
    AdminLinkUpdate,
    PublicLinkSchema,
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
        detail={"error": {"code": "NOT_FOUND", "message": "链接不存在"}},
    )


def _public(link: SocialLink) -> PublicLinkSchema:
    return PublicLinkSchema(
        id=str(link.id),
        platform=link.platform,
        slug=link.slug,
        description=link.description,
        url=link.url,
        icon_name=link.icon_name,
        is_primary=link.is_primary,
    )


def _admin_item(link: SocialLink) -> AdminLinkItem:
    return AdminLinkItem(
        id=str(link.id),
        platform=link.platform,
        slug=link.slug,
        description=link.description,
        url=link.url,
        icon_name=link.icon_name,
        is_primary=link.is_primary,
        is_active=link.is_active,
        sort_order=link.sort_order,
        updated_at=link.updated_at,
    )


# ---- 公开 ----
async def list_public_links(session: AsyncSession) -> list[PublicLinkSchema]:
    return [_public(link) for link in await repo.list_active(session)]


# ---- 后台 ----
async def admin_list_links(session: AsyncSession) -> list[AdminLinkItem]:
    return [_admin_item(link) for link in await repo.admin_list(session)]


async def create_link(session: AsyncSession, payload: AdminLinkCreate) -> AdminLinkItem:
    slug = payload.slug or _slugify(payload.platform)
    if await repo.get_by_slug(session, slug) is not None:
        raise _conflict(f"slug 已存在：{slug}")
    link = SocialLink(
        platform=payload.platform,
        slug=slug,
        description=payload.description,
        url=payload.url,
        icon_name=payload.icon_name,
        is_primary=payload.is_primary,
        is_active=payload.is_active,
        sort_order=payload.sort_order,
    )
    await repo.persist(session, link)
    return _admin_item(link)


async def update_link(
    session: AsyncSession, link_id: str, payload: AdminLinkUpdate
) -> AdminLinkItem:
    link = await repo.admin_get(session, link_id)
    if link is None:
        raise _not_found()
    data = payload.model_dump(exclude_unset=True)

    new_slug = data.get("slug")
    if new_slug and new_slug != link.slug and await repo.get_by_slug(session, new_slug):
        raise _conflict(f"slug 已存在：{new_slug}")

    fields = (
        "platform",
        "slug",
        "description",
        "url",
        "is_primary",
        "is_active",
        "sort_order",
    )
    for field in fields:
        if field in data and data[field] is not None:
            setattr(link, field, data[field])
    if "icon_name" in data:
        link.icon_name = data["icon_name"]

    await repo.persist(session, link)
    return _admin_item(link)


async def delete_link(session: AsyncSession, link_id: str) -> None:
    link = await repo.admin_get(session, link_id)
    if link is None:
        raise _not_found()
    await repo.remove(session, link)
