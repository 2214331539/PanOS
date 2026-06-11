from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import apply_no_store, apply_public_cache
from app.db.session import get_session
from app.modules.views import service
from app.modules.views.schemas import ViewCount, ViewCreate, ViewSummary
from app.schemas.responses import DataEnvelope

router = APIRouter(prefix="/views", tags=["views"])


@router.post("", response_model=DataEnvelope[ViewCount], status_code=status.HTTP_201_CREATED)
async def record_view(
    payload: ViewCreate,
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[ViewCount]:
    apply_no_store(response)
    return DataEnvelope(data=await service.record_view(session, request, payload.path))


@router.get("/summary", response_model=DataEnvelope[ViewSummary])
async def view_summary(
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[ViewSummary]:
    data = await service.summary(session)
    # 访客计数允许 30s 的轻微滞后，避免每个访客都打库。
    apply_public_cache(response, f"views:{data.total}:{data.today}", max_age=30)
    return DataEnvelope(data=data)
