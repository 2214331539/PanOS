from app.modules.desktop.schemas import (
    DesktopBootstrapSchema,
    LatestSchema,
    ProfileSchema,
    WallpaperSchema,
    WidgetSchema,
)


def get_desktop_bootstrap() -> DesktopBootstrapSchema:
    return DesktopBootstrapSchema(
        profile=ProfileSchema(
            name="潘廷峰",
            english_name="Pan Daniel",
            subtitle="欢迎来到小潘同学的个人创作空间",
            current_mode="Building",
            roles=[
                "AI Agent Researcher",
                "Web Builder",
                "Product Explorer",
                "Content Creator",
            ],
        ),
        wallpaper=WallpaperSchema(
            type="image",
            url="https://images.unsplash.com/photo-1568507058983-7e7fc6682ab8?q=80&w=2560&h=1440&fit=crop",
            alt="Kelingking cliff, Nusa Penida, Indonesia",
        ),
        widgets=[
            WidgetSchema(
                id="now",
                type="now",
                title="Now",
                payload={"lines": ["正在研究：Agent Memory", "正在开发：PanOS"]},
            )
        ],
        latest=LatestSchema(articles=[], projects=[], timeline=[]),
        links=[],
    )

