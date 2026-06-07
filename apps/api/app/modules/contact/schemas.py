from pydantic import Field

from app.schemas.base import ApiModel


class ContactCreate(ApiModel):
    name: str = Field(min_length=1, max_length=80)
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    topic: str | None = Field(default=None, max_length=120)
    message: str = Field(min_length=10, max_length=2000)


class ContactCreated(ApiModel):
    id: str
    status: str
