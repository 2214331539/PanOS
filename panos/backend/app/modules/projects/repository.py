from uuid import UUID

from sqlalchemy import Row, delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.content import Category, MediaAsset, Project, ProjectLink
from app.db.models.enums import ProjectStatus, Visibility

# 公开查询带出的列：Project + 分类名/slug + 封面 url/alt
PublicRow = Row[tuple[Project, str, str, str | None, str | None]]

_PUBLIC = (Project.visibility == Visibility.public,)

_PUBLIC_COLUMNS = (
    select(Project, Category.name, Category.slug, MediaAsset.public_url, MediaAsset.alt)
    .outerjoin(Category, Project.category_id == Category.id)
    .outerjoin(MediaAsset, Project.cover_media_id == MediaAsset.id)
)


async def list_public(
    session: AsyncSession,
    *,
    category: str | None,
    status: ProjectStatus | None,
    page: int,
    page_size: int,
) -> tuple[list[PublicRow], int]:
    stmt = _PUBLIC_COLUMNS.where(*_PUBLIC).order_by(
        Project.is_featured.desc(), Project.sort_order.asc(), Project.published_at.desc()
    )
    count_stmt = (
        select(func.count())
        .select_from(Project)
        .outerjoin(Category, Project.category_id == Category.id)
        .where(*_PUBLIC)
    )
    if category:
        stmt = stmt.where(Category.slug == category)
        count_stmt = count_stmt.where(Category.slug == category)
    if status is not None:
        stmt = stmt.where(Project.status == status)
        count_stmt = count_stmt.where(Project.status == status)

    total = await session.scalar(count_stmt) or 0
    result = await session.execute(stmt.offset((page - 1) * page_size).limit(page_size))
    return list(result.all()), total


async def get_public_by_slug(session: AsyncSession, slug: str) -> PublicRow | None:
    stmt = _PUBLIC_COLUMNS.where(*_PUBLIC, Project.slug == slug)
    return (await session.execute(stmt)).first()


async def list_links(session: AsyncSession, project_ids: list[UUID]) -> list[ProjectLink]:
    if not project_ids:
        return []
    stmt = (
        select(ProjectLink)
        .where(ProjectLink.project_id.in_(project_ids))
        .order_by(ProjectLink.sort_order.asc())
    )
    return list((await session.scalars(stmt)).all())


async def replace_links(
    session: AsyncSession, project_id: UUID, links: list[ProjectLink]
) -> None:
    await session.execute(delete(ProjectLink).where(ProjectLink.project_id == project_id))
    session.add_all(links)


async def get_by_slug(session: AsyncSession, slug: str) -> Project | None:
    project: Project | None = await session.scalar(select(Project).where(Project.slug == slug))
    return project


async def admin_list(
    session: AsyncSession, *, page: int, page_size: int
) -> tuple[list[Project], int]:
    stmt = select(Project).order_by(Project.updated_at.desc())
    count_stmt = select(func.count()).select_from(Project)
    total = await session.scalar(count_stmt) or 0
    result = await session.scalars(stmt.offset((page - 1) * page_size).limit(page_size))
    return list(result.all()), total


async def admin_get(session: AsyncSession, project_id: str) -> Project | None:
    return await session.get(Project, UUID(project_id))


async def persist(session: AsyncSession, project: Project) -> Project:
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return project


async def remove(session: AsyncSession, project: Project) -> None:
    await session.delete(project)
    await session.commit()
