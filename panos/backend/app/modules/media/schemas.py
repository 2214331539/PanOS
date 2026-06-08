from app.schemas.base import ApiModel


class MediaUploadResult(ApiModel):
    id: str
    url: str
    width: int | None = None
    height: int | None = None
