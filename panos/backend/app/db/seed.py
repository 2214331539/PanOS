"""开发种子数据：文章分类 + 示例文章 + 站点资料。

运行：uv run python -m app.db.seed
幂等：按 (module, slug) / slug / key 判断是否已存在。
"""

import asyncio
from datetime import UTC, datetime
from typing import TypedDict
from uuid import UUID

from sqlalchemy import select

from app.db.models.content import Article, Category, SiteSetting
from app.db.models.enums import ContentStatus, Visibility
from app.db.session import async_session_factory


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

PROFILE_VALUE = {
    "name": "潘廷峰",
    "englishName": "Pan Daniel",
    "subtitle": "欢迎来到小潘同学的个人创作空间",
    "currentMode": "Building",
    "roles": ["AI Agent Researcher", "Web Builder", "Product Explorer", "Content Creator"],
}


async def main() -> None:
    async with async_session_factory() as session:
        # 分类
        category_ids: dict[str, UUID] = {}
        for sort_order, (slug, name) in enumerate(ARTICLE_CATEGORIES):
            existing = await session.scalar(
                select(Category).where(Category.module == "articles", Category.slug == slug)
            )
            if existing is None:
                existing = Category(
                    module="articles", name=name, slug=slug, sort_order=sort_order, is_active=True
                )
                session.add(existing)
                await session.flush()
            category_ids[slug] = existing.id

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
                    reading_minutes=max(1, len(body) // 400),
                    is_featured=False,
                    published_at=item["published_at"],
                )
            )

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
