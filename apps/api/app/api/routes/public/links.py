from fastapi import APIRouter, Response

from app.core.cache import apply_public_cache
from app.modules.links.schemas import PublicLinkSchema
from app.modules.links.service import list_public_links
from app.schemas.responses import DataEnvelope

router = APIRouter(prefix="/links", tags=["links"])


@router.get("", response_model=DataEnvelope[list[PublicLinkSchema]])
async def links(response: Response) -> DataEnvelope[list[PublicLinkSchema]]:
    data = list_public_links()
    apply_public_cache(response, "links:empty")
    return DataEnvelope(data=data)

