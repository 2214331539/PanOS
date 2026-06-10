from datetime import date, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.models.base import Base, TimestampMixin, UuidPrimaryKeyMixin
from app.db.models.enums import (
    AdminRole,
    ContactStatus,
    ContentStatus,
    MediaType,
    ProjectStatus,
    Visibility,
)


class AdminUser(Base, TimestampMixin):
    __tablename__ = "admin_users"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[AdminRole] = mapped_column(Enum(AdminRole), nullable=False)
    avatar_media_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True),
        # use_alter 打破 admin_users ↔ media_assets 的相互外键环，便于 Alembic 排序建表。
        ForeignKey(
            "media_assets.id",
            use_alter=True,
            name="fk_admin_users_avatar_media_id_media_assets",
        ),
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class SiteSetting(Base):
    __tablename__ = "site_settings"

    key: Mapped[str] = mapped_column(String, primary_key=True)
    group: Mapped[str] = mapped_column(String, nullable=False)
    value: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_by: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("admin_users.id"), nullable=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class MediaAsset(Base, UuidPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "media_assets"
    __table_args__ = (UniqueConstraint("bucket", "path", name="uq_media_assets_bucket_path"),)

    bucket: Mapped[str] = mapped_column(String, nullable=False)
    path: Mapped[str] = mapped_column(String, nullable=False)
    public_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    type: Mapped[MediaType] = mapped_column(Enum(MediaType), nullable=False)
    mime_type: Mapped[str] = mapped_column(String, nullable=False)
    file_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    alt: Mapped[str | None] = mapped_column(Text, nullable=True)
    title: Mapped[str | None] = mapped_column(String, nullable=True)
    blurhash: Mapped[str | None] = mapped_column(String, nullable=True)
    created_by: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("admin_users.id"), nullable=True
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Category(Base, UuidPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "categories"
    __table_args__ = (UniqueConstraint("module", "slug", name="uq_categories_module_slug"),)

    module: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Tag(Base, UuidPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "tags"

    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    color: Mapped[str | None] = mapped_column(String, nullable=True)


class Article(Base, UuidPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "articles"

    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    excerpt: Mapped[str] = mapped_column(Text, nullable=False)
    body_mdx: Mapped[str] = mapped_column(Text, nullable=False)
    category_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True
    )
    cover_media_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("media_assets.id"), nullable=True
    )
    status: Mapped[ContentStatus] = mapped_column(
        Enum(ContentStatus), default=ContentStatus.draft, nullable=False
    )
    visibility: Mapped[Visibility] = mapped_column(
        Enum(Visibility), default=Visibility.public, nullable=False
    )
    reading_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    seo_title: Mapped[str | None] = mapped_column(String, nullable=True)
    seo_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Project(Base, UuidPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "projects"

    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    tagline: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    category_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True
    )
    cover_media_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("media_assets.id"), nullable=True
    )
    status: Mapped[ProjectStatus] = mapped_column(
        Enum(ProjectStatus), default=ProjectStatus.concept, nullable=False
    )
    visibility: Mapped[Visibility] = mapped_column(
        Enum(Visibility), default=Visibility.public, nullable=False
    )
    tech_stack: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, nullable=False)
    background_mdx: Mapped[str | None] = mapped_column(Text, nullable=True)
    features: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    architecture_mdx: Mapped[str | None] = mapped_column(Text, nullable=True)
    process_mdx: Mapped[str | None] = mapped_column(Text, nullable=True)
    roadmap_mdx: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class ProjectLink(Base, UuidPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "project_links"

    project_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[str] = mapped_column(String, nullable=False)
    label: Mapped[str] = mapped_column(String, nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class GalleryItem(Base, UuidPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "gallery_items"

    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True
    )
    media_asset_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("media_assets.id"), nullable=False
    )
    tool: Mapped[str | None] = mapped_column(String, nullable=True)
    shot_at: Mapped[date | None] = mapped_column(Date, nullable=True)
    visibility: Mapped[Visibility] = mapped_column(
        Enum(Visibility), default=Visibility.public, nullable=False
    )
    status: Mapped[ContentStatus] = mapped_column(
        Enum(ContentStatus), default=ContentStatus.published, nullable=False
    )
    allow_download: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class SocialLink(Base, UuidPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "social_links"

    platform: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    icon_name: Mapped[str | None] = mapped_column(String, nullable=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class Widget(Base, UuidPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "widgets"

    type: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class ContactMessage(Base, UuidPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "contact_messages"

    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    topic: Mapped[str | None] = mapped_column(String, nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ContactStatus] = mapped_column(
        Enum(ContactStatus), default=ContactStatus.new, nullable=False
    )
    ip_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
