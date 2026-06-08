from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.content import Category


async def list_active(session: AsyncSession, module: str) -> list[Category]:
    stmt = (
        select(Category)
        .where(Category.module == module, Category.is_active.is_(True))
        .order_by(Category.sort_order)
    )
    return list((await session.scalars(stmt)).all())
