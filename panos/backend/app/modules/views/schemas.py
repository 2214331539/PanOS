from pydantic import Field

from app.schemas.base import ApiModel


class ViewCreate(ApiModel):
    # 仅接受站内路径，限制长度防滥用。
    path: str = Field(min_length=1, max_length=200, pattern=r"^/[\w\-/]*$")


class ViewCount(ApiModel):
    path: str
    count: int


class ViewSummary(ApiModel):
    total: int
    today: int
