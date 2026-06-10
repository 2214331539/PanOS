from datetime import datetime
from typing import Any

from app.db.models.enums import ProjectStatus, Visibility
from app.schemas.base import ApiModel
from app.schemas.refs import CategoryRefSchema, CoverSchema


class ProjectLinkSchema(ApiModel):
    type: str
    label: str
    url: str


class ProjectCardSchema(ApiModel):
    id: str
    slug: str
    name: str
    tagline: str
    summary: str | None = None
    cover: CoverSchema | None = None
    category: CategoryRefSchema | None = None
    status: str
    tech_stack: list[str]
    is_featured: bool
    links: list[ProjectLinkSchema]
    published_at: datetime | None = None


class ProjectDetailSchema(ProjectCardSchema):
    background_mdx: str | None = None
    features: Any | None = None
    architecture_mdx: str | None = None
    process_mdx: str | None = None
    roadmap_mdx: str | None = None


# ---- 后台 ----
class AdminProjectLinkInput(ApiModel):
    type: str
    label: str
    url: str


class AdminProjectListItem(ApiModel):
    id: str
    slug: str
    name: str
    status: str
    visibility: str
    is_featured: bool
    sort_order: int
    updated_at: datetime
    published_at: datetime | None = None


class AdminProjectDetail(ApiModel):
    id: str
    slug: str
    name: str
    tagline: str
    summary: str | None = None
    category_id: str | None = None
    cover_media_id: str | None = None
    status: str
    visibility: str
    tech_stack: list[str]
    background_mdx: str | None = None
    features: Any | None = None
    architecture_mdx: str | None = None
    process_mdx: str | None = None
    roadmap_mdx: str | None = None
    is_featured: bool
    sort_order: int
    links: list[ProjectLinkSchema]
    published_at: datetime | None = None


class AdminProjectCreate(ApiModel):
    name: str
    slug: str | None = None
    tagline: str
    summary: str | None = None
    category_id: str | None = None
    cover_media_id: str | None = None
    status: ProjectStatus = ProjectStatus.concept
    visibility: Visibility = Visibility.public
    tech_stack: list[str] = []
    background_mdx: str | None = None
    features: Any | None = None
    architecture_mdx: str | None = None
    process_mdx: str | None = None
    roadmap_mdx: str | None = None
    is_featured: bool = False
    sort_order: int = 0
    links: list[AdminProjectLinkInput] = []


class AdminProjectUpdate(ApiModel):
    name: str | None = None
    slug: str | None = None
    tagline: str | None = None
    summary: str | None = None
    category_id: str | None = None
    cover_media_id: str | None = None
    status: ProjectStatus | None = None
    visibility: Visibility | None = None
    tech_stack: list[str] | None = None
    background_mdx: str | None = None
    features: Any | None = None
    architecture_mdx: str | None = None
    process_mdx: str | None = None
    roadmap_mdx: str | None = None
    is_featured: bool | None = None
    sort_order: int | None = None
    links: list[AdminProjectLinkInput] | None = None
