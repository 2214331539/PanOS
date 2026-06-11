from datetime import datetime

from pydantic import Field

from app.db.models.enums import IdeaStatus, Visibility
from app.schemas.base import ApiModel


class IdeaSchema(ApiModel):
    id: str
    title: str
    summary: str
    body_mdx: str | None = None
    status: str
    source: str | None = None
    is_featured: bool
    created_at: datetime


class AdminIdeaItem(IdeaSchema):
    visibility: str
    updated_at: datetime


class AdminIdeaCreate(ApiModel):
    title: str = Field(min_length=1, max_length=200)
    summary: str = Field(min_length=1)
    body_mdx: str | None = None
    status: IdeaStatus = IdeaStatus.seed
    visibility: Visibility = Visibility.public
    source: str | None = None
    is_featured: bool = False


class AdminIdeaUpdate(ApiModel):
    title: str | None = None
    summary: str | None = None
    body_mdx: str | None = None
    status: IdeaStatus | None = None
    visibility: Visibility | None = None
    source: str | None = None
    is_featured: bool | None = None
