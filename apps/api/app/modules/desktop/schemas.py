from app.schemas.base import ApiModel


class ProfileSchema(ApiModel):
    name: str
    english_name: str
    subtitle: str
    current_mode: str
    roles: list[str]


class WallpaperSchema(ApiModel):
    type: str
    url: str
    alt: str


class WidgetSchema(ApiModel):
    id: str
    type: str
    title: str
    payload: dict[str, object]


class LatestSchema(ApiModel):
    articles: list[object]
    projects: list[object]
    timeline: list[object]


class DesktopBootstrapSchema(ApiModel):
    profile: ProfileSchema
    wallpaper: WallpaperSchema
    widgets: list[WidgetSchema]
    latest: LatestSchema
    links: list[object]
