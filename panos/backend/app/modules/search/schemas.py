from typing import Literal

from app.schemas.base import ApiModel

SearchResultType = Literal["article", "project", "gallery", "link"]


class SearchResultSchema(ApiModel):
    type: SearchResultType
    id: str
    slug: str
    title: str
    excerpt: str
    # article/project 为站内路径（/articles/x），link 为外部 URL，gallery 为空。
    url: str
