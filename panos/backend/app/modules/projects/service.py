from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import not_found, slug_conflict
from app.core.text import slugify
from app.db.models.content import Project, ProjectLink
from app.db.models.enums import ProjectStatus, Visibility
from app.modules.projects import repository as repo
from app.modules.projects.repository import PublicRow
from app.modules.projects.schemas import (
    AdminProjectCreate,
    AdminProjectDetail,
    AdminProjectLinkInput,
    AdminProjectListItem,
    AdminProjectUpdate,
    ProjectCardSchema,
    ProjectDetailSchema,
    ProjectLinkSchema,
)
from app.schemas.refs import CategoryRefSchema, CoverSchema


def _links_schema(links: list[ProjectLink]) -> list[ProjectLinkSchema]:
    return [ProjectLinkSchema(type=link.type, label=link.label, url=link.url) for link in links]


def _card(row: PublicRow, links: list[ProjectLink]) -> ProjectCardSchema:
    project, cat_name, cat_slug, cover_url, cover_alt = row
    return ProjectCardSchema(
        id=str(project.id),
        slug=project.slug,
        name=project.name,
        tagline=project.tagline,
        summary=project.summary,
        cover=CoverSchema(url=cover_url, alt=cover_alt) if cover_url else None,
        category=CategoryRefSchema(name=cat_name, slug=cat_slug) if cat_name and cat_slug else None,
        status=project.status.value,
        tech_stack=project.tech_stack,
        is_featured=project.is_featured,
        links=_links_schema(links),
        published_at=project.published_at,
    )


def _admin_detail(p: Project, links: list[ProjectLink]) -> AdminProjectDetail:
    return AdminProjectDetail(
        id=str(p.id),
        slug=p.slug,
        name=p.name,
        tagline=p.tagline,
        summary=p.summary,
        category_id=str(p.category_id) if p.category_id else None,
        cover_media_id=str(p.cover_media_id) if p.cover_media_id else None,
        status=p.status.value,
        visibility=p.visibility.value,
        tech_stack=p.tech_stack,
        background_mdx=p.background_mdx,
        features=p.features,
        architecture_mdx=p.architecture_mdx,
        process_mdx=p.process_mdx,
        roadmap_mdx=p.roadmap_mdx,
        is_featured=p.is_featured,
        sort_order=p.sort_order,
        links=_links_schema(links),
        published_at=p.published_at,
    )


def _link_models(project_id: UUID, inputs: list[AdminProjectLinkInput]) -> list[ProjectLink]:
    return [
        ProjectLink(
            project_id=project_id,
            type=item.type,
            label=item.label,
            url=item.url,
            sort_order=index,
        )
        for index, item in enumerate(inputs)
    ]


# ---- 公开 ----
async def list_projects(
    session: AsyncSession,
    *,
    category: str | None,
    status: ProjectStatus | None,
    page: int,
    page_size: int,
) -> tuple[list[ProjectCardSchema], int]:
    rows, total = await repo.list_public(
        session, category=category, status=status, page=page, page_size=page_size
    )
    links = await repo.list_links(session, [row[0].id for row in rows])
    by_project: dict[UUID, list[ProjectLink]] = {}
    for link in links:
        by_project.setdefault(link.project_id, []).append(link)
    return [_card(row, by_project.get(row[0].id, [])) for row in rows], total


async def get_project(session: AsyncSession, slug: str) -> ProjectDetailSchema:
    row = await repo.get_public_by_slug(session, slug)
    if row is None:
        raise not_found("项目不存在")
    project = row[0]
    links = await repo.list_links(session, [project.id])
    card = _card(row, links)
    return ProjectDetailSchema(
        **card.model_dump(by_alias=False),
        background_mdx=project.background_mdx,
        features=project.features,
        architecture_mdx=project.architecture_mdx,
        process_mdx=project.process_mdx,
        roadmap_mdx=project.roadmap_mdx,
    )


# ---- 后台 ----
async def admin_list_projects(
    session: AsyncSession, *, page: int, page_size: int
) -> tuple[list[AdminProjectListItem], int]:
    items, total = await repo.admin_list(session, page=page, page_size=page_size)
    return [
        AdminProjectListItem(
            id=str(p.id),
            slug=p.slug,
            name=p.name,
            status=p.status.value,
            visibility=p.visibility.value,
            is_featured=p.is_featured,
            sort_order=p.sort_order,
            updated_at=p.updated_at,
            published_at=p.published_at,
        )
        for p in items
    ], total


async def admin_get_project(session: AsyncSession, project_id: str) -> AdminProjectDetail:
    project = await repo.admin_get(session, project_id)
    if project is None:
        raise not_found("项目不存在")
    links = await repo.list_links(session, [project.id])
    return _admin_detail(project, links)


async def create_project(session: AsyncSession, payload: AdminProjectCreate) -> AdminProjectDetail:
    slug = payload.slug or slugify(payload.name)
    if await repo.get_by_slug(session, slug) is not None:
        raise slug_conflict(slug)
    project = Project(
        slug=slug,
        name=payload.name,
        tagline=payload.tagline,
        summary=payload.summary,
        category_id=UUID(payload.category_id) if payload.category_id else None,
        cover_media_id=UUID(payload.cover_media_id) if payload.cover_media_id else None,
        status=payload.status,
        visibility=payload.visibility,
        tech_stack=payload.tech_stack,
        background_mdx=payload.background_mdx,
        features=payload.features,
        architecture_mdx=payload.architecture_mdx,
        process_mdx=payload.process_mdx,
        roadmap_mdx=payload.roadmap_mdx,
        is_featured=payload.is_featured,
        sort_order=payload.sort_order,
        published_at=datetime.now(UTC) if payload.visibility == Visibility.public else None,
    )
    session.add(project)
    await session.flush()
    await repo.replace_links(session, project.id, _link_models(project.id, payload.links))
    await repo.persist(session, project)
    links = await repo.list_links(session, [project.id])
    return _admin_detail(project, links)


async def update_project(
    session: AsyncSession, project_id: str, payload: AdminProjectUpdate
) -> AdminProjectDetail:
    project = await repo.admin_get(session, project_id)
    if project is None:
        raise not_found("项目不存在")
    data = payload.model_dump(exclude_unset=True)

    new_slug = data.get("slug")
    if new_slug and new_slug != project.slug and await repo.get_by_slug(session, new_slug):
        raise slug_conflict(new_slug)

    simple_fields = (
        "name",
        "slug",
        "tagline",
        "summary",
        "tech_stack",
        "background_mdx",
        "features",
        "architecture_mdx",
        "process_mdx",
        "roadmap_mdx",
        "is_featured",
        "sort_order",
    )
    for field in simple_fields:
        if field in data and data[field] is not None:
            setattr(project, field, data[field])
    if "category_id" in data:
        project.category_id = UUID(data["category_id"]) if data["category_id"] else None
    if "cover_media_id" in data:
        project.cover_media_id = UUID(data["cover_media_id"]) if data["cover_media_id"] else None
    if data.get("status") is not None:
        project.status = data["status"]
    if data.get("visibility") is not None:
        project.visibility = data["visibility"]
        if data["visibility"] == Visibility.public and project.published_at is None:
            project.published_at = datetime.now(UTC)
    if payload.links is not None:
        await repo.replace_links(session, project.id, _link_models(project.id, payload.links))

    await repo.persist(session, project)
    links = await repo.list_links(session, [project.id])
    return _admin_detail(project, links)


async def delete_project(session: AsyncSession, project_id: str) -> None:
    project = await repo.admin_get(session, project_id)
    if project is None:
        raise not_found("项目不存在")
    await repo.remove(session, project)
