from datetime import UTC, datetime
from io import BytesIO

from fastapi import HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.models.content import MediaAsset
from app.db.models.enums import MediaType
from app.modules.media.repository import save_media_asset
from app.modules.media.schemas import MediaUploadResult
from app.modules.media.storage import get_storage

ALLOWED_TYPES: dict[str, str] = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


def _error(code: str, message: str, status_code: int) -> HTTPException:
    return HTTPException(
        status_code=status_code, detail={"error": {"code": code, "message": message}}
    )


async def upload_image(session: AsyncSession, file: UploadFile) -> MediaUploadResult:
    settings = get_settings()

    if file.content_type not in ALLOWED_TYPES:
        raise _error(
            "UNSUPPORTED_MEDIA",
            "仅支持 png / jpg / webp / gif",
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
        )

    data = await file.read()
    if len(data) > settings.upload_max_bytes:
        raise _error("FILE_TOO_LARGE", "图片超过大小限制", status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)

    try:
        with Image.open(BytesIO(data)) as img:
            width, height = img.size
    except (UnidentifiedImageError, OSError) as exc:
        raise _error("INVALID_IMAGE", "不是有效的图片文件", status.HTTP_400_BAD_REQUEST) from exc

    ext = ALLOWED_TYPES[file.content_type]
    subdir = datetime.now(UTC).strftime("%Y/%m")
    rel_path, url = get_storage().save(data, ext, subdir)

    asset = await save_media_asset(
        session,
        MediaAsset(
            bucket="local",
            path=rel_path,
            public_url=url,
            type=MediaType.image,
            mime_type=file.content_type,
            file_size=len(data),
            width=width,
            height=height,
            alt=file.filename,
            title=file.filename,
        ),
    )
    return MediaUploadResult(id=str(asset.id), url=url, width=width, height=height)
