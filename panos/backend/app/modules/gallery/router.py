from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import apply_no_store, apply_public_cache
from app.core.security import AdminPrincipal, require_admin_user
from app.db.session import get_session
from app.modules.gallery import service
from app.modules.gallery.schemas import (
    AdminGalleryCreate,
    AdminGalleryDetail,
    AdminGalleryListItem,
    AdminGalleryUpdate,
    GalleryItemSchema,
)
from app.schemas.responses import DataEnvelope

public_router = APIRouter(prefix="/gallery", tags=["gallery"])
admin_router = APIRouter(prefix="/admin/gallery", tags=["admin"])


@public_router.get("", response_model=DataEnvelope[list[GalleryItemSchema]])
async def list_gallery(
    response: Response,
    category: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=24, ge=1, le=48, alias="pageSize"),
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[GalleryItemSchema]]:
    items, total = await service.list_gallery(
        session, category=category, page=page, page_size=page_size
    )
    apply_public_cache(response, f"gallery:{category}:{page}:{page_size}:{total}")
    return DataEnvelope(
        data=items,
        meta={
            "page": page,
            "pageSize": page_size,
            "total": total,
            "hasMore": page * page_size < total,
        },
    )


@admin_router.get("", response_model=DataEnvelope[list[AdminGalleryListItem]])
async def admin_list_gallery(
    response: Response,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100, alias="pageSize"),
    _: AdminPrincipal = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[AdminGalleryListItem]]:
    apply_no_store(response)
    items, total = await service.admin_list_gallery(session, page=page, page_size=page_size)
    return DataEnvelope(data=items, meta={"page": page, "pageSize": page_size, "total": total})


@admin_router.get("/{item_id}", response_model=DataEnvelope[AdminGalleryDetail])
async def admin_get_gallery_item(
    item_id: str,
    response: Response,
    _: AdminPrincipal = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminGalleryDetail]:
    apply_no_store(response)
    return DataEnvelope(data=await service.admin_get_gallery_item(session, item_id))


@admin_router.post(
    "", response_model=DataEnvelope[AdminGalleryDetail], status_code=status.HTTP_201_CREATED
)
async def admin_create_gallery_item(
    payload: AdminGalleryCreate,
    _: AdminPrincipal = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminGalleryDetail]:
    return DataEnvelope(data=await service.create_gallery_item(session, payload))


@admin_router.patch("/{item_id}", response_model=DataEnvelope[AdminGalleryDetail])
async def admin_update_gallery_item(
    item_id: str,
    payload: AdminGalleryUpdate,
    _: AdminPrincipal = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminGalleryDetail]:
    return DataEnvelope(data=await service.update_gallery_item(session, item_id, payload))


@admin_router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_gallery_item(
    item_id: str,
    _: AdminPrincipal = Depends(require_admin_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    await service.delete_gallery_item(session, item_id)


router = APIRouter()
router.include_router(public_router)
router.include_router(admin_router)
