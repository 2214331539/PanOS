import datetime

from pydantic import Field

from app.db.models.enums import TimelineType, Visibility
from app.schemas.base import ApiModel


class TimelineEventSchema(ApiModel):
    id: str
    date: datetime.date
    type: str
    title: str
    description: str | None = None
    url: str | None = None
    is_featured: bool


class AdminTimelineItem(TimelineEventSchema):
    visibility: str
    sort_order: int
    updated_at: datetime.datetime


class AdminTimelineCreate(ApiModel):
    date: datetime.date
    type: TimelineType
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    url: str | None = None
    visibility: Visibility = Visibility.public
    is_featured: bool = False
    sort_order: int = 0


class AdminTimelineUpdate(ApiModel):
    date: datetime.date | None = None
    type: TimelineType | None = None
    title: str | None = None
    description: str | None = None
    url: str | None = None
    visibility: Visibility | None = None
    is_featured: bool | None = None
    sort_order: int | None = None
