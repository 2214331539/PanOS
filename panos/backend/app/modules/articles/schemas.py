from datetime import datetime

from app.db.models.enums import ContentStatus, Visibility
from app.schemas.base import ApiModel
from app.schemas.refs import CategoryRefSchema, CoverSchema


class ArticleNavSchema(ApiModel):
    slug: str
    title: str


class ArticleCardSchema(ApiModel):
    id: str
    slug: str
    title: str
    excerpt: str
    cover: CoverSchema | None = None
    category: CategoryRefSchema | None = None
    reading_minutes: int | None = None
    published_at: datetime | None = None


class ArticleDetailSchema(ArticleCardSchema):
    body_mdx: str
    previous: ArticleNavSchema | None = None
    next: ArticleNavSchema | None = None


# ---- 后台 ----
class AdminArticleListItem(ApiModel):
    id: str
    slug: str
    title: str
    status: str
    visibility: str
    category_id: str | None = None
    updated_at: datetime
    published_at: datetime | None = None


class AdminArticleDetail(ApiModel):
    id: str
    slug: str
    title: str
    excerpt: str
    body_mdx: str
    category_id: str | None = None
    cover_media_id: str | None = None
    status: str
    visibility: str
    is_featured: bool
    reading_minutes: int | None = None
    seo_title: str | None = None
    seo_description: str | None = None
    published_at: datetime | None = None


class AdminArticleCreate(ApiModel):
    title: str
    slug: str | None = None
    excerpt: str
    body_mdx: str
    category_id: str | None = None
    cover_media_id: str | None = None
    status: ContentStatus = ContentStatus.draft
    visibility: Visibility = Visibility.public
    is_featured: bool = False
    seo_title: str | None = None
    seo_description: str | None = None


class AdminArticleUpdate(ApiModel):
    title: str | None = None
    slug: str | None = None
    excerpt: str | None = None
    body_mdx: str | None = None
    category_id: str | None = None
    cover_media_id: str | None = None
    status: ContentStatus | None = None
    visibility: Visibility | None = None
    is_featured: bool | None = None
    seo_title: str | None = None
    seo_description: str | None = None
