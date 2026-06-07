from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

TData = TypeVar("TData")


class DataEnvelope(BaseModel, Generic[TData]):
    data: TData
    meta: dict[str, Any] = Field(default_factory=dict)


class ErrorEnvelope(BaseModel):
    error: dict[str, Any]

