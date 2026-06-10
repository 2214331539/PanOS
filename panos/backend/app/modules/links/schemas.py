from datetime import datetime

from app.schemas.base import ApiModel


class PublicLinkSchema(ApiModel):
    id: str
    platform: str
    slug: str
    description: str
    url: str
    icon_name: str | None = None
    is_primary: bool


# ---- 后台 ----
class AdminLinkItem(ApiModel):
    id: str
    platform: str
    slug: str
    description: str
    url: str
    icon_name: str | None = None
    is_primary: bool
    is_active: bool
    sort_order: int
    updated_at: datetime


class AdminLinkCreate(ApiModel):
    platform: str
    slug: str | None = None
    description: str
    url: str
    icon_name: str | None = None
    is_primary: bool = False
    is_active: bool = True
    sort_order: int = 0


class AdminLinkUpdate(ApiModel):
    platform: str | None = None
    slug: str | None = None
    description: str | None = None
    url: str | None = None
    icon_name: str | None = None
    is_primary: bool | None = None
    is_active: bool | None = None
    sort_order: int | None = None
