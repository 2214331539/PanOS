from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import apply_public_cache
from app.db.session import get_session
from app.modules.search import service
from app.modules.search.schemas import SearchResultSchema
from app.schemas.responses import DataEnvelope

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=DataEnvelope[list[SearchResultSchema]])
async def search(
    response: Response,
    q: str = Query(min_length=1, max_length=80),
    limit: int = Query(default=12, ge=1, le=20),
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[SearchResultSchema]]:
    data = await service.search(session, q, limit)
    apply_public_cache(
        response, "search:" + q + ":" + ",".join(item.id for item in data), max_age=30
    )
    return DataEnvelope(data=data, meta={"total": len(data)})
