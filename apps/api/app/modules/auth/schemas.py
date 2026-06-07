from app.schemas.base import ApiModel


class AdminMe(ApiModel):
    id: str
    email: str
    display_name: str
    role: str
