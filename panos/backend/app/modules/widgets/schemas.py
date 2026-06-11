from datetime import datetime
from typing import Any

from app.schemas.base import ApiModel


class PublicWidgetSchema(ApiModel):
    id: str
    type: str
    title: str
    payload: dict[str, Any]


# ---- 后台 ----
class AdminWidgetItem(ApiModel):
    id: str
    type: str
    title: str
    payload: dict[str, Any]
    is_enabled: bool
    sort_order: int
    updated_at: datetime


class AdminWidgetCreate(ApiModel):
    type: str
    title: str
    payload: dict[str, Any] = {}
    is_enabled: bool = True
    sort_order: int = 0


class AdminWidgetUpdate(ApiModel):
    type: str | None = None
    title: str | None = None
    payload: dict[str, Any] | None = None
    is_enabled: bool | None = None
    sort_order: int | None = None
