import datetime

from pydantic import Field

from app.schemas.base import ApiModel

# 字段名 date 会在类体内遮蔽 datetime.date，注解一律用模块限定名。


class CalendarEventSchema(ApiModel):
    id: str
    date: datetime.date
    title: str


class CalendarEventCreate(ApiModel):
    date: datetime.date
    title: str = Field(min_length=1, max_length=120)


class CalendarEventUpdate(ApiModel):
    date: datetime.date | None = None
    title: str | None = Field(default=None, min_length=1, max_length=120)
