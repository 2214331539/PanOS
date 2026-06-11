from datetime import date, datetime

from app.db.models.enums import ContentStatus, Visibility
from app.schemas.base import ApiModel
from app.schemas.refs import CategoryRefSchema


class GalleryMediaSchema(ApiModel):
    url: str
    width: int | None = None
    height: int | None = None
    alt: str | None = None


class GalleryItemSchema(ApiModel):
    id: str
    slug: str
    title: str
    description: str | None = None
    category: CategoryRefSchema | None = None
    media: GalleryMediaSchema
    tool: str | None = None
    shot_at: date | None = None
    allow_download: bool


# ---- 后台 ----
class AdminGalleryListItem(ApiModel):
    id: str
    slug: str
    title: str
    status: str
    visibility: str
    media_url: str | None = None
    sort_order: int
    updated_at: datetime


class AdminGalleryDetail(ApiModel):
    id: str
    slug: str
    title: str
    description: str | None = None
    category_id: str | None = None
    media_asset_id: str
    media_url: str | None = None
    tool: str | None = None
    shot_at: date | None = None
    status: str
    visibility: str
    allow_download: bool
    sort_order: int


class AdminGalleryCreate(ApiModel):
    title: str
    slug: str | None = None
    description: str | None = None
    category_id: str | None = None
    media_asset_id: str
    tool: str | None = None
    shot_at: date | None = None
    status: ContentStatus = ContentStatus.published
    visibility: Visibility = Visibility.public
    allow_download: bool = False
    sort_order: int = 0


class AdminGalleryUpdate(ApiModel):
    title: str | None = None
    slug: str | None = None
    description: str | None = None
    category_id: str | None = None
    media_asset_id: str | None = None
    tool: str | None = None
    shot_at: date | None = None
    status: ContentStatus | None = None
    visibility: Visibility | None = None
    allow_download: bool | None = None
    sort_order: int | None = None
