from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.categories import repository as repo
from app.modules.categories.schemas import CategorySchema


async def list_categories(session: AsyncSession, module: str) -> list[CategorySchema]:
    categories = await repo.list_active(session, module)
    return [
        CategorySchema(
            id=str(c.id),
            module=c.module,
            name=c.name,
            slug=c.slug,
            description=c.description,
            sort_order=c.sort_order,
        )
        for c in categories
    ]
