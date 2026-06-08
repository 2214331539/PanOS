from datetime import datetime

from app.schemas.base import ApiModel


class AdminMe(ApiModel):
    id: str
    email: str
    display_name: str
    role: str


class LoginRequest(ApiModel):
    username: str
    password: str


class LoginResult(ApiModel):
    access_token: str
    expires_at: datetime
