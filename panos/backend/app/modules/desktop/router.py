from fastapi import APIRouter, Response

from app.core.cache import apply_public_cache
from app.modules.desktop.schemas import DesktopBootstrapSchema
from app.modules.desktop.service import get_desktop_bootstrap
from app.schemas.responses import DataEnvelope

router = APIRouter(prefix="/desktop", tags=["desktop"])


@router.get("/bootstrap", response_model=DataEnvelope[DesktopBootstrapSchema])
async def bootstrap(response: Response) -> DataEnvelope[DesktopBootstrapSchema]:
    data = get_desktop_bootstrap()
    apply_public_cache(response, data.model_dump_json())
    return DataEnvelope(data=data)
