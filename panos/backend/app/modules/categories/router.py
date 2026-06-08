from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import apply_public_cache
from app.db.session import get_session
from app.modules.categories import service
from app.modules.categories.schemas import CategorySchema
from app.schemas.responses import DataEnvelope

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=DataEnvelope[list[CategorySchema]])
async def list_categories(
    response: Response,
    module: str = Query(default="articles"),
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[CategorySchema]]:
    data = await service.list_categories(session, module)
    apply_public_cache(response, f"categories:{module}:{len(data)}")
    return DataEnvelope(data=data)
