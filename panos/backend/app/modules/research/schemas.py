import datetime

from pydantic import Field

from app.db.models.enums import ContentStatus, Visibility
from app.schemas.base import ApiModel


class ResearchCardSchema(ApiModel):
    id: str
    slug: str
    title: str
    excerpt: str
    progress: int | None = None
    started_at: datetime.date | None = None
    published_at: datetime.datetime | None = None


class ResearchDetailSchema(ResearchCardSchema):
    body_mdx: str


class AdminResearchItem(ResearchCardSchema):
    status: str
    visibility: str
    updated_at: datetime.datetime


class AdminResearchCreate(ApiModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str | None = None
    excerpt: str = Field(min_length=1)
    body_mdx: str = ""
    status: ContentStatus = ContentStatus.draft
    visibility: Visibility = Visibility.public
    progress: int | None = Field(default=None, ge=0, le=100)
    started_at: datetime.date | None = None


class AdminResearchUpdate(ApiModel):
    title: str | None = None
    slug: str | None = None
    excerpt: str | None = None
    body_mdx: str | None = None
    status: ContentStatus | None = None
    visibility: Visibility | None = None
    progress: int | None = Field(default=None, ge=0, le=100)
    started_at: datetime.date | None = None
