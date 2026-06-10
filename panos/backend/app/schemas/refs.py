"""跨模块共享的展示型引用 schema（封面、分类引用）。

只放纯展示的小对象；各模块自己的业务 schema 仍留在模块内（垂直切片）。
"""

from app.schemas.base import ApiModel


class CoverSchema(ApiModel):
    url: str
    alt: str | None = None


class CategoryRefSchema(ApiModel):
    name: str
    slug: str
