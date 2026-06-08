from app.schemas.base import ApiModel


class CategorySchema(ApiModel):
    id: str
    module: str
    name: str
    slug: str
    description: str | None = None
    sort_order: int
