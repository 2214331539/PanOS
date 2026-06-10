from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import not_found, slug_conflict
from app.core.text import slugify
from app.db.models.content import Article
from app.db.models.enums import ContentStatus
from app.modules.articles import repository as repo
from app.modules.articles.repository import PublicRow
from app.modules.articles.schemas import (
    AdminArticleCreate,
    AdminArticleDetail,
    AdminArticleListItem,
    AdminArticleUpdate,
    ArticleCardSchema,
    ArticleDetailSchema,
    ArticleNavSchema,
)
from app.schemas.refs import CategoryRefSchema, CoverSchema


def reading_minutes(body: str) -> int:
    """按正文长度估算阅读分钟数（seed 等场景复用）。"""
    return max(1, len(body) // 400)


def _cover(url: str | None, alt: str | None) -> CoverSchema | None:
    return CoverSchema(url=url, alt=alt) if url else None


def _category(name: str | None, slug: str | None) -> CategoryRefSchema | None:
    return CategoryRefSchema(name=name, slug=slug) if name and slug else None


def _card(row: PublicRow) -> ArticleCardSchema:
    article, cat_name, cat_slug, cover_url, cover_alt = row
    return ArticleCardSchema(
        id=str(article.id),
        slug=article.slug,
        title=article.title,
        excerpt=article.excerpt,
        cover=_cover(cover_url, cover_alt),
        category=_category(cat_name, cat_slug),
        reading_minutes=article.reading_minutes,
        published_at=article.published_at,
    )


def _admin_detail(a: Article) -> AdminArticleDetail:
    return AdminArticleDetail(
        id=str(a.id),
        slug=a.slug,
        title=a.title,
        excerpt=a.excerpt,
        body_mdx=a.body_mdx,
        category_id=str(a.category_id) if a.category_id else None,
        cover_media_id=str(a.cover_media_id) if a.cover_media_id else None,
        status=a.status.value,
        visibility=a.visibility.value,
        is_featured=a.is_featured,
        reading_minutes=a.reading_minutes,
        seo_title=a.seo_title,
        seo_description=a.seo_description,
        published_at=a.published_at,
    )


def _admin_item(a: Article) -> AdminArticleListItem:
    return AdminArticleListItem(
        id=str(a.id),
        slug=a.slug,
        title=a.title,
        status=a.status.value,
        visibility=a.visibility.value,
        category_id=str(a.category_id) if a.category_id else None,
        updated_at=a.updated_at,
        published_at=a.published_at,
    )


# ---- 公开 ----
async def list_articles(
    session: AsyncSession, *, category: str | None, page: int, page_size: int
) -> tuple[list[ArticleCardSchema], int]:
    rows, total = await repo.list_published(
        session, category=category, page=page, page_size=page_size
    )
    return [_card(row) for row in rows], total


async def get_article(session: AsyncSession, slug: str) -> ArticleDetailSchema:
    row = await repo.get_published_by_slug(session, slug)
    if row is None:
        raise not_found("文章不存在")
    article = row[0]
    previous: ArticleNavSchema | None = None
    nxt: ArticleNavSchema | None = None
    if article.published_at is not None:
        prev_row, next_row = await repo.get_adjacent(session, article.published_at)
        if prev_row is not None:
            previous = ArticleNavSchema(slug=prev_row[0], title=prev_row[1])
        if next_row is not None:
            nxt = ArticleNavSchema(slug=next_row[0], title=next_row[1])
    card = _card(row)
    return ArticleDetailSchema(
        **card.model_dump(by_alias=False),
        body_mdx=article.body_mdx,
        previous=previous,
        next=nxt,
    )


# ---- 后台 ----
async def admin_list_articles(
    session: AsyncSession, *, status: ContentStatus | None, page: int, page_size: int
) -> tuple[list[AdminArticleListItem], int]:
    items, total = await repo.admin_list(session, status=status, page=page, page_size=page_size)
    return [_admin_item(a) for a in items], total


async def admin_get_article(session: AsyncSession, article_id: str) -> AdminArticleDetail:
    article = await repo.admin_get(session, article_id)
    if article is None:
        raise not_found("文章不存在")
    return _admin_detail(article)


async def create_article(session: AsyncSession, payload: AdminArticleCreate) -> AdminArticleDetail:
    slug = payload.slug or slugify(payload.title)
    if await repo.get_by_slug(session, slug) is not None:
        raise slug_conflict(slug)
    article = Article(
        slug=slug,
        title=payload.title,
        excerpt=payload.excerpt,
        body_mdx=payload.body_mdx,
        category_id=UUID(payload.category_id) if payload.category_id else None,
        cover_media_id=UUID(payload.cover_media_id) if payload.cover_media_id else None,
        status=payload.status,
        visibility=payload.visibility,
        is_featured=payload.is_featured,
        reading_minutes=reading_minutes(payload.body_mdx),
        seo_title=payload.seo_title,
        seo_description=payload.seo_description,
        published_at=datetime.now(UTC)
        if payload.status == ContentStatus.published
        else None,
    )
    await repo.persist(session, article)
    return _admin_detail(article)


async def update_article(
    session: AsyncSession, article_id: str, payload: AdminArticleUpdate
) -> AdminArticleDetail:
    article = await repo.admin_get(session, article_id)
    if article is None:
        raise not_found("文章不存在")
    data = payload.model_dump(exclude_unset=True)

    new_slug = data.get("slug")
    if new_slug and new_slug != article.slug and await repo.get_by_slug(session, new_slug):
        raise slug_conflict(new_slug)

    simple_fields = (
        "title",
        "slug",
        "excerpt",
        "body_mdx",
        "is_featured",
        "seo_title",
        "seo_description",
    )
    for field in simple_fields:
        if field in data and data[field] is not None:
            setattr(article, field, data[field])
    if "category_id" in data:
        article.category_id = UUID(data["category_id"]) if data["category_id"] else None
    if "cover_media_id" in data:
        article.cover_media_id = UUID(data["cover_media_id"]) if data["cover_media_id"] else None
    if data.get("visibility") is not None:
        article.visibility = data["visibility"]
    if data.get("body_mdx"):
        article.reading_minutes = reading_minutes(data["body_mdx"])
    if data.get("status") is not None:
        article.status = data["status"]
        if data["status"] == ContentStatus.published and article.published_at is None:
            article.published_at = datetime.now(UTC)

    await repo.persist(session, article)
    return _admin_detail(article)
