from typing import Any

from pydantic import BaseModel, Field


class DataEnvelope[TData](BaseModel):
    data: TData
    meta: dict[str, Any] = Field(default_factory=dict)


class ErrorEnvelope(BaseModel):
    error: dict[str, Any]

