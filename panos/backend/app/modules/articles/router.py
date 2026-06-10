from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import apply_no_store, apply_public_cache
from app.core.security import require_admin_user
from app.db.models.enums import ContentStatus
from app.db.session import get_session
from app.modules.articles import service
from app.modules.articles.schemas import (
    AdminArticleCreate,
    AdminArticleDetail,
    AdminArticleListItem,
    AdminArticleUpdate,
    ArticleCardSchema,
    ArticleDetailSchema,
)
from app.schemas.responses import DataEnvelope

public_router = APIRouter(prefix="/articles", tags=["articles"])
admin_router = APIRouter(
    dependencies=[Depends(require_admin_user)], prefix="/admin/articles", tags=["admin"]
)


@public_router.get("", response_model=DataEnvelope[list[ArticleCardSchema]])
async def list_articles(
    response: Response,
    category: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=24, alias="pageSize"),
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[ArticleCardSchema]]:
    items, total = await service.list_articles(
        session, category=category, page=page, page_size=page_size
    )
    apply_public_cache(response, f"articles:{category}:{page}:{page_size}:{total}")
    return DataEnvelope(
        data=items,
        meta={
            "page": page,
            "pageSize": page_size,
            "total": total,
            "hasMore": page * page_size < total,
        },
    )


@public_router.get("/{slug}", response_model=DataEnvelope[ArticleDetailSchema])
async def get_article(
    slug: str,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[ArticleDetailSchema]:
    data = await service.get_article(session, slug)
    apply_public_cache(response, f"article:{slug}:{data.published_at}")
    return DataEnvelope(data=data)


@admin_router.get("", response_model=DataEnvelope[list[AdminArticleListItem]])
async def admin_list_articles(
    response: Response,
    status_filter: ContentStatus | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100, alias="pageSize"),
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[AdminArticleListItem]]:
    apply_no_store(response)
    items, total = await service.admin_list_articles(
        session, status=status_filter, page=page, page_size=page_size
    )
    return DataEnvelope(data=items, meta={"page": page, "pageSize": page_size, "total": total})


@admin_router.get("/{article_id}", response_model=DataEnvelope[AdminArticleDetail])
async def admin_get_article(
    article_id: str,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminArticleDetail]:
    apply_no_store(response)
    return DataEnvelope(data=await service.admin_get_article(session, article_id))


@admin_router.post(
    "", response_model=DataEnvelope[AdminArticleDetail], status_code=status.HTTP_201_CREATED
)
async def admin_create_article(
    payload: AdminArticleCreate,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminArticleDetail]:
    return DataEnvelope(data=await service.create_article(session, payload))


@admin_router.patch("/{article_id}", response_model=DataEnvelope[AdminArticleDetail])
async def admin_update_article(
    article_id: str,
    payload: AdminArticleUpdate,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminArticleDetail]:
    return DataEnvelope(data=await service.update_article(session, article_id, payload))


router = APIRouter()
router.include_router(public_router)
router.include_router(admin_router)
