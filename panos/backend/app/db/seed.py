"""开发种子数据：分类 + 示例文章/项目/图库/社交链接 + 站点资料。

运行：uv run python -m app.db.seed
幂等：按 (module, slug) / slug / key 判断是否已存在。
"""

import asyncio
from datetime import UTC, date, datetime
from typing import TypedDict
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.content import (
    Article,
    CalendarEvent,
    Category,
    GalleryItem,
    Idea,
    MediaAsset,
    Project,
    ProjectLink,
    ResearchNote,
    SiteSetting,
    SocialLink,
    TimelineEvent,
    Widget,
)
from app.db.models.enums import (
    ContentStatus,
    IdeaStatus,
    MediaType,
    ProjectStatus,
    TimelineType,
    Visibility,
)
from app.db.session import async_session_factory
from app.modules.articles.service import reading_minutes


class ArticleSeed(TypedDict):
    slug: str
    title: str
    excerpt: str
    category: str
    published_at: datetime
    body_mdx: str


ARTICLE_CATEGORIES = [
    ("ai-agent", "AI & Agent"),
    ("web-development", "Web Development"),
    ("product-thinking", "Product Thinking"),
    ("entrepreneurship", "Entrepreneurship"),
    ("life-notes", "Life Notes"),
    ("essays", "Essays"),
]

SAMPLE_ARTICLES: list[ArticleSeed] = [
    {
        "slug": "agent-memory-intro",
        "title": "Agent Memory 的核心价值",
        "excerpt": "为什么「记忆」是让 AI Agent 从玩具走向产品的关键一步。",
        "category": "ai-agent",
        "published_at": datetime(2026, 6, 6, tzinfo=UTC),
        "body_mdx": (
            "## 为什么需要记忆\n\n"
            "一个没有记忆的 Agent 每次对话都从零开始。引入记忆后，它能记住偏好、"
            "复用过往结论、跨会话延续任务。\n\n"
            "### 记忆的三层\n\n"
            "- **短期**：当前会话上下文\n"
            "- **情景**：过往交互的检索\n"
            "- **语义**：从交互中抽取的结构化知识\n\n"
            "```python\n"
            "def retrieve(query: str, k: int = 5) -> list[Memory]:\n"
            "    embedding = embed(query)\n"
            "    return vector_store.search(embedding, k=k)\n"
            "```\n\n"
            "> 记忆不是把所有东西都记住，而是知道什么值得记住。\n"
        ),
    },
    {
        "slug": "building-panos",
        "title": "把个人网站做成一台操作系统",
        "excerpt": "PanOS 的设计取舍：桌面隐喻、窗口系统与可持续维护的内容后台。",
        "category": "web-development",
        "published_at": datetime(2026, 5, 20, tzinfo=UTC),
        "body_mdx": (
            "## 桌面隐喻\n\n"
            "用 Dock、窗口、Widget、Spotlight 把内容组织成一个可探索的空间，"
            "而不是又一个滚动的博客首页。\n\n"
            "| 模块 | 隐喻 |\n"
            "| --- | --- |\n"
            "| Articles | 文档文件夹 |\n"
            "| Projects | App Store |\n"
            "| Gallery | Photos |\n\n"
            "关键是克制——借用操作系统的秩序感，而不是复刻一个玩具系统。\n"
        ),
    },
    {
        "slug": "small-ideas",
        "title": "把还没成型的想法慢慢做成真实的东西",
        "excerpt": "关于个人产品、研究与创作之间的连接方式。",
        "category": "essays",
        "published_at": datetime(2026, 5, 8, tzinfo=UTC),
        "body_mdx": (
            "## 想法的生命周期\n\n"
            "Seed → Growing → Draft → Built。大多数想法停在 Seed，"
            "但只要有一个被认真做出来，就值得。\n\n"
            "持续地、温柔地，把脑子里的东西一点点变成现实。\n"
        ),
    },
]

PROJECT_CATEGORIES = [
    ("ai-projects", "AI Projects"),
    ("web-apps", "Web Apps"),
    ("product-experiments", "Product Experiments"),
    ("research-tools", "Research Tools"),
]

GALLERY_CATEGORIES = [
    ("photography", "Photography"),
    ("ai-images", "AI Images"),
    ("ui-design", "UI Design"),
    ("screenshots", "Screenshots"),
]


class ProjectSeed(TypedDict):
    slug: str
    name: str
    tagline: str
    summary: str
    category: str
    status: ProjectStatus
    tech_stack: list[str]
    background_mdx: str
    links: list[tuple[str, str, str]]  # (type, label, url)
    published_at: datetime


SAMPLE_PROJECTS: list[ProjectSeed] = [
    {
        "slug": "panos",
        "name": "PanOS",
        "tagline": "浏览器里的个人操作系统",
        "summary": "把文章、项目、图库、社交链接组织成一个 macOS 风格的桌面空间。",
        "category": "web-apps",
        "status": ProjectStatus.building,
        "tech_stack": ["React", "TypeScript", "FastAPI", "PostgreSQL"],
        "background_mdx": (
            "## 为什么做 PanOS\n\n"
            "传统博客装不下多种内容类型，所以把个人网站做成一台「操作系统」，"
            "每类内容都是一个可打开的 App。\n"
        ),
        "links": [("github", "GitHub", "https://github.com/2214331539")],
        "published_at": datetime(2026, 6, 8, tzinfo=UTC),
    },
    {
        "slug": "agent-memory-lab",
        "name": "Agent Memory Lab",
        "tagline": "AI Agent 记忆机制的实验场",
        "summary": "探索短期 / 情景 / 语义三层记忆在 Agent 中的检索与遗忘策略。",
        "category": "ai-projects",
        "status": ProjectStatus.prototype,
        "tech_stack": ["Python", "PostgreSQL", "pgvector"],
        "background_mdx": (
            "## 研究问题\n\n一个没有记忆的 Agent 每次对话都从零开始。"
            "这个项目验证不同记忆检索策略对长任务表现的影响。\n"
        ),
        "links": [],
        "published_at": datetime(2026, 5, 18, tzinfo=UTC),
    },
]


class GallerySeed(TypedDict):
    slug: str
    title: str
    description: str
    category: str
    url: str
    width: int
    height: int
    tool: str
    shot_at: date


SAMPLE_GALLERY: list[GallerySeed] = [
    {
        "slug": "panos-wallpaper",
        "title": "PanOS Wallpaper",
        "description": "PanOS 默认桌面壁纸。",
        "category": "ui-design",
        "url": (
            "https://images.unsplash.com/photo-1568507058983-7e7fc6682ab8"
            "?q=80&w=1600&h=900&fit=crop"
        ),
        "width": 1600,
        "height": 900,
        "tool": "Unsplash",
        "shot_at": date(2026, 6, 7),
    },
    {
        "slug": "desk-setup",
        "title": "Desk Setup",
        "description": "写代码和写文章的地方。",
        "category": "photography",
        "url": (
            "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d"
            "?auto=format&fit=crop&w=1600&q=80"
        ),
        "width": 1600,
        "height": 1066,
        "tool": "Camera",
        "shot_at": date(2026, 5, 30),
    },
    {
        "slug": "window-light",
        "title": "Window Light",
        "description": "下午四点的窗边光线。",
        "category": "photography",
        "url": (
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb"
            "?auto=format&fit=crop&w=1600&q=80"
        ),
        "width": 1600,
        "height": 1200,
        "tool": "Camera",
        "shot_at": date(2026, 5, 12),
    },
]

class LinkSeed(TypedDict):
    platform: str
    slug: str
    description: str
    url: str
    icon_name: str
    is_primary: bool


SAMPLE_LINKS: list[LinkSeed] = [
    {
        "platform": "GitHub",
        "slug": "github",
        "description": "My code, experiments, and open-source projects.",
        "url": "https://github.com/2214331539",
        "icon_name": "Github",
        "is_primary": True,
    },
    {
        "platform": "小红书",
        "slug": "xiaohongshu",
        "description": "内容创作、产品观察和生活切片。",
        "url": "https://www.xiaohongshu.com",
        "icon_name": "BookOpen",
        "is_primary": False,
    },
    {
        "platform": "Email",
        "slug": "email",
        "description": "研究交流、项目合作和内容共创。",
        "url": "mailto:cja.china@gmail.com",
        "icon_name": "Mail",
        "is_primary": False,
    },
]

SAMPLE_CALENDAR: list[tuple[date, str]] = [
    (date(2026, 6, 15), "发布 Agent Memory 系列第二篇"),
    (date(2026, 6, 20), "PanOS 上线部署"),
]

SAMPLE_IDEAS: list[tuple[str, str, IdeaStatus]] = [
    ("给 Agent 做一个遗忘曲线", "记忆不该只增不减，按访问频率和时间做衰减。", IdeaStatus.seed),
    (
        "PanOS 的 Terminal App",
        "用命令行探索整个站点：ls projects、cat about.md。",
        IdeaStatus.growing,
    ),
    ("个人网站的「开机体验」", "进入网站像开机：logo、进度条、然后桌面亮起。", IdeaStatus.draft),
    ("把个人网站做成操作系统", "PanOS 本身——这个想法已经被做出来了。", IdeaStatus.built),
]

class ResearchSeed(TypedDict):
    slug: str
    title: str
    excerpt: str
    body_mdx: str
    progress: int
    started_at: date


SAMPLE_RESEARCH: list[ResearchSeed] = [
    {
        "slug": "agent-memory-retrieval",
        "title": "Agent 记忆检索策略对比",
        "excerpt": "向量检索、关键词、混合检索在长程任务中的表现差异。",
        "body_mdx": "## 实验设置\n\n对比三种检索策略在 100 轮对话任务中的记忆命中率。\n",
        "progress": 60,
        "started_at": date(2026, 4, 10),
    },
    {
        "slug": "memory-forgetting-curve",
        "title": "记忆遗忘机制",
        "excerpt": "什么样的记忆应该被淡忘：访问频率、时间衰减与重要度评分。",
        "body_mdx": "## 问题\n\n记忆库只增不减会让检索越来越差。\n",
        "progress": 25,
        "started_at": date(2026, 5, 20),
    },
]

SAMPLE_TIMELINE: list[tuple[date, TimelineType, str, str | None]] = [
    (
        date(2026, 6, 10),
        TimelineType.project,
        "PanOS 完成 V1 全部功能",
        "桌面、内容、后台、测试、部署配置全部就绪。",
    ),
    (date(2026, 6, 6), TimelineType.writing, "发布《Agent Memory 的核心价值》", None),
    (date(2026, 5, 20), TimelineType.research, "启动记忆遗忘机制研究", "从遗忘曲线开始。"),
    (date(2026, 5, 8), TimelineType.life, "整理个人创作空间", "把散落各处的想法收进一个系统。"),
    (date(2026, 4, 10), TimelineType.research, "启动 Agent 记忆检索研究", None),
]

SAMPLE_WIDGETS: list[dict[str, object]] = [
    {"type": "clock", "title": "Clock", "payload": {}},
    {
        "type": "now",
        "title": "Now",
        "payload": {
            "lines": ["正在研究：Agent Memory", "正在开发：PanOS", "正在整理：个人创作空间"]
        },
    },
    {"type": "github", "title": "GitHub", "payload": {"username": "2214331539"}},
    {"type": "visitors", "title": "Visitors", "payload": {}},
]

PROFILE_VALUE = {
    "name": "潘廷峰",
    "englishName": "Pan Daniel",
    "subtitle": "欢迎来到小潘同学的个人创作空间",
    "currentMode": "Building",
    "roles": ["AI Agent Researcher", "Web Builder", "Product Explorer", "Content Creator"],
}


async def _ensure_categories(
    session: AsyncSession, module: str, items: list[tuple[str, str]]
) -> dict[str, UUID]:
    ids: dict[str, UUID] = {}
    for sort_order, (slug, name) in enumerate(items):
        existing = await session.scalar(
            select(Category).where(Category.module == module, Category.slug == slug)
        )
        if existing is None:
            existing = Category(
                module=module, name=name, slug=slug, sort_order=sort_order, is_active=True
            )
            session.add(existing)
            await session.flush()
        ids[slug] = existing.id
    return ids


async def main() -> None:
    async with async_session_factory() as session:
        # 分类
        category_ids = await _ensure_categories(session, "articles", ARTICLE_CATEGORIES)
        project_category_ids = await _ensure_categories(session, "projects", PROJECT_CATEGORIES)
        gallery_category_ids = await _ensure_categories(session, "gallery", GALLERY_CATEGORIES)

        # 文章
        for item in SAMPLE_ARTICLES:
            exists = await session.scalar(select(Article).where(Article.slug == item["slug"]))
            if exists is not None:
                continue
            body = item["body_mdx"]
            session.add(
                Article(
                    slug=item["slug"],
                    title=item["title"],
                    excerpt=item["excerpt"],
                    body_mdx=body,
                    category_id=category_ids.get(item["category"]),
                    status=ContentStatus.published,
                    visibility=Visibility.public,
                    reading_minutes=reading_minutes(body),
                    is_featured=False,
                    published_at=item["published_at"],
                )
            )

        # 项目 + 项目链接
        for project_sort, project_item in enumerate(SAMPLE_PROJECTS):
            existing_project = await session.scalar(
                select(Project).where(Project.slug == project_item["slug"])
            )
            if existing_project is not None:
                continue
            project = Project(
                slug=project_item["slug"],
                name=project_item["name"],
                tagline=project_item["tagline"],
                summary=project_item["summary"],
                category_id=project_category_ids.get(project_item["category"]),
                status=project_item["status"],
                visibility=Visibility.public,
                tech_stack=project_item["tech_stack"],
                background_mdx=project_item["background_mdx"],
                is_featured=project_sort == 0,
                sort_order=project_sort,
                published_at=project_item["published_at"],
            )
            session.add(project)
            await session.flush()
            for link_sort, (link_type, label, url) in enumerate(project_item["links"]):
                session.add(
                    ProjectLink(
                        project_id=project.id,
                        type=link_type,
                        label=label,
                        url=url,
                        sort_order=link_sort,
                    )
                )

        # 图库（媒体资源 + 图库条目）
        for gallery_sort, gallery_item in enumerate(SAMPLE_GALLERY):
            existing_gallery = await session.scalar(
                select(GalleryItem).where(GalleryItem.slug == gallery_item["slug"])
            )
            if existing_gallery is not None:
                continue
            asset = await session.scalar(
                select(MediaAsset).where(
                    MediaAsset.bucket == "seed", MediaAsset.path == gallery_item["slug"]
                )
            )
            if asset is None:
                asset = MediaAsset(
                    bucket="seed",
                    path=gallery_item["slug"],
                    public_url=gallery_item["url"],
                    type=MediaType.image,
                    mime_type="image/jpeg",
                    width=gallery_item["width"],
                    height=gallery_item["height"],
                    alt=gallery_item["title"],
                    title=gallery_item["title"],
                )
                session.add(asset)
                await session.flush()
            session.add(
                GalleryItem(
                    slug=gallery_item["slug"],
                    title=gallery_item["title"],
                    description=gallery_item["description"],
                    category_id=gallery_category_ids.get(gallery_item["category"]),
                    media_asset_id=asset.id,
                    tool=gallery_item["tool"],
                    shot_at=gallery_item["shot_at"],
                    status=ContentStatus.published,
                    visibility=Visibility.public,
                    allow_download=False,
                    sort_order=gallery_sort,
                )
            )

        # 社交链接
        for link_sort, link_item in enumerate(SAMPLE_LINKS):
            existing_link = await session.scalar(
                select(SocialLink).where(SocialLink.slug == link_item["slug"])
            )
            if existing_link is not None:
                continue
            session.add(
                SocialLink(
                    platform=link_item["platform"],
                    slug=link_item["slug"],
                    description=link_item["description"],
                    url=link_item["url"],
                    icon_name=link_item["icon_name"],
                    is_primary=link_item["is_primary"],
                    is_active=True,
                    sort_order=link_sort,
                )
            )

        # 桌面 Widget（按 type 幂等）
        for widget_sort, widget_item in enumerate(SAMPLE_WIDGETS):
            existing_widget = await session.scalar(
                select(Widget).where(Widget.type == str(widget_item["type"]))
            )
            if existing_widget is not None:
                continue
            session.add(
                Widget(
                    type=str(widget_item["type"]),
                    title=str(widget_item["title"]),
                    payload=widget_item["payload"],
                    is_enabled=True,
                    sort_order=widget_sort,
                )
            )

        # V2：想法 / 研究笔记 / 时间线（均按标题或 slug 幂等）
        for idea_title, idea_summary, idea_status in SAMPLE_IDEAS:
            if await session.scalar(select(Idea).where(Idea.title == idea_title)) is None:
                session.add(
                    Idea(title=idea_title, summary=idea_summary, status=idea_status)
                )

        for research_item in SAMPLE_RESEARCH:
            exists_note = await session.scalar(
                select(ResearchNote).where(ResearchNote.slug == research_item["slug"])
            )
            if exists_note is None:
                session.add(
                    ResearchNote(
                        slug=research_item["slug"],
                        title=research_item["title"],
                        excerpt=research_item["excerpt"],
                        body_mdx=research_item["body_mdx"],
                        status=ContentStatus.published,
                        visibility=Visibility.public,
                        progress=research_item["progress"],
                        started_at=research_item["started_at"],
                        published_at=datetime(2026, 6, 1, tzinfo=UTC),
                    )
                )

        for tl_date, tl_type, tl_title, tl_desc in SAMPLE_TIMELINE:
            exists_tl = await session.scalar(
                select(TimelineEvent).where(TimelineEvent.title == tl_title)
            )
            if exists_tl is None:
                session.add(
                    TimelineEvent(
                        event_date=tl_date, type=tl_type, title=tl_title, description=tl_desc
                    )
                )

        # 日历计划（按 日期+标题 幂等）
        for event_date, event_title in SAMPLE_CALENDAR:
            existing_event = await session.scalar(
                select(CalendarEvent).where(
                    CalendarEvent.event_date == event_date,
                    CalendarEvent.title == event_title,
                )
            )
            if existing_event is None:
                session.add(CalendarEvent(event_date=event_date, title=event_title))

        # 站点资料
        profile = await session.get(SiteSetting, "profile")
        if profile is None:
            session.add(
                SiteSetting(
                    key="profile",
                    group="profile",
                    value=PROFILE_VALUE,
                    description="个人资料",
                )
            )

        await session.commit()
    print("✅ seed done")


if __name__ == "__main__":
    asyncio.run(main())
