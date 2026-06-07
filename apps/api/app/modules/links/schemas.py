from app.schemas.base import ApiModel


class PublicLinkSchema(ApiModel):
    id: str
    platform: str
    slug: str
    description: str
    url: str
    icon_name: str | None = None
    is_primary: bool
