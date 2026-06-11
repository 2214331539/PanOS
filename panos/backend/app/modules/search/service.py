from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.search import repository as repo
from app.modules.search.schemas import SearchResultSchema

# 每类内容的单类上限：保证结果多样性，避免一类刷满列表。
PER_TYPE_LIMIT = 5


def _clip(text: str | None, length: int = 80) -> str:
    if not text:
        return ""
    return text if len(text) <= length else text[: length - 1] + "…"


async def search(session: AsyncSession, query: str, limit: int) -> list[SearchResultSchema]:
    per_type = min(PER_TYPE_LIMIT, limit)
    results: list[SearchResultSchema] = []

    for article in await repo.search_articles(session, query, per_type):
        results.append(
            SearchResultSchema(
                type="article",
                id=str(article.id),
                slug=article.slug,
                title=article.title,
                excerpt=_clip(article.excerpt),
                url=f"/articles/{article.slug}",
            )
        )
    for project in await repo.search_projects(session, query, per_type):
        results.append(
            SearchResultSchema(
                type="project",
                id=str(project.id),
                slug=project.slug,
                title=project.name,
                excerpt=_clip(project.tagline),
                url=f"/projects/{project.slug}",
            )
        )
    for item in await repo.search_gallery(session, query, per_type):
        results.append(
            SearchResultSchema(
                type="gallery",
                id=str(item.id),
                slug=item.slug,
                title=item.title,
                excerpt=_clip(item.description),
                url="",
            )
        )
    for link in await repo.search_links(session, query, per_type):
        results.append(
            SearchResultSchema(
                type="link",
                id=str(link.id),
                slug=link.slug,
                title=link.platform,
                excerpt=_clip(link.description),
                url=link.url,
            )
        )

    return results[:limit]
