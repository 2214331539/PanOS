from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_admin_user
from app.db.session import get_session
from app.modules.media.schemas import MediaUploadResult
from app.modules.media.service import upload_image
from app.schemas.responses import DataEnvelope

router = APIRouter(
    dependencies=[Depends(require_admin_user)], prefix="/admin/media", tags=["admin"]
)


@router.post("/upload", response_model=DataEnvelope[MediaUploadResult])
async def upload(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[MediaUploadResult]:
    data = await upload_image(session, file)
    return DataEnvelope(data=data)
