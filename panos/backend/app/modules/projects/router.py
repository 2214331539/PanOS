from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import apply_no_store, apply_public_cache
from app.core.security import require_admin_user
from app.db.models.enums import ProjectStatus
from app.db.session import get_session
from app.modules.projects import service
from app.modules.projects.schemas import (
    AdminProjectCreate,
    AdminProjectDetail,
    AdminProjectListItem,
    AdminProjectUpdate,
    ProjectCardSchema,
    ProjectDetailSchema,
)
from app.modules.views import service as views_service
from app.schemas.responses import DataEnvelope

public_router = APIRouter(prefix="/projects", tags=["projects"])
admin_router = APIRouter(
    dependencies=[Depends(require_admin_user)], prefix="/admin/projects", tags=["admin"]
)


@public_router.get("", response_model=DataEnvelope[list[ProjectCardSchema]])
async def list_projects(
    response: Response,
    category: str | None = Query(default=None),
    status_filter: ProjectStatus | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=24, alias="pageSize"),
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[ProjectCardSchema]]:
    items, total = await service.list_projects(
        session, category=category, status=status_filter, page=page, page_size=page_size
    )
    apply_public_cache(
        response, f"projects:{category}:{status_filter}:{page}:{page_size}:{total}"
    )
    return DataEnvelope(
        data=items,
        meta={
            "page": page,
            "pageSize": page_size,
            "total": total,
            "hasMore": page * page_size < total,
        },
    )


@public_router.get("/{slug}", response_model=DataEnvelope[ProjectDetailSchema])
async def get_project(
    slug: str,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[ProjectDetailSchema]:
    data = await service.get_project(session, slug)
    data.view_count = await views_service.count_for_path(session, f"/projects/{slug}")
    apply_public_cache(response, f"project:{slug}:{data.published_at}:{data.view_count}")
    return DataEnvelope(data=data)


@admin_router.get("", response_model=DataEnvelope[list[AdminProjectListItem]])
async def admin_list_projects(
    response: Response,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100, alias="pageSize"),
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[list[AdminProjectListItem]]:
    apply_no_store(response)
    items, total = await service.admin_list_projects(session, page=page, page_size=page_size)
    return DataEnvelope(data=items, meta={"page": page, "pageSize": page_size, "total": total})


@admin_router.get("/{project_id}", response_model=DataEnvelope[AdminProjectDetail])
async def admin_get_project(
    project_id: str,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminProjectDetail]:
    apply_no_store(response)
    return DataEnvelope(data=await service.admin_get_project(session, project_id))


@admin_router.post(
    "", response_model=DataEnvelope[AdminProjectDetail], status_code=status.HTTP_201_CREATED
)
async def admin_create_project(
    payload: AdminProjectCreate,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminProjectDetail]:
    return DataEnvelope(data=await service.create_project(session, payload))


@admin_router.patch("/{project_id}", response_model=DataEnvelope[AdminProjectDetail])
async def admin_update_project(
    project_id: str,
    payload: AdminProjectUpdate,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[AdminProjectDetail]:
    return DataEnvelope(data=await service.update_project(session, project_id, payload))


@admin_router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_project(
    project_id: str,
    session: AsyncSession = Depends(get_session),
) -> None:
    await service.delete_project(session, project_id)


router = APIRouter()
router.include_router(public_router)
router.include_router(admin_router)
