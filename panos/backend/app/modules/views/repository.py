from datetime import date

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.content import PageView


async def record(session: AsyncSession, *, path: str, ip_hash: str, view_date: date) -> None:
    """同访客同路径同天只记一条（唯一约束 + ON CONFLICT DO NOTHING）。"""
    stmt = (
        insert(PageView)
        .values(path=path, ip_hash=ip_hash, view_date=view_date)
        .on_conflict_do_nothing(constraint="uq_page_views_path_ip_date")
    )
    await session.execute(stmt)
    await session.commit()


async def count_for_path(session: AsyncSession, path: str) -> int:
    return (
        await session.scalar(
            select(func.count()).select_from(PageView).where(PageView.path == path)
        )
        or 0
    )


async def totals(session: AsyncSession, *, today: date) -> tuple[int, int]:
    total = await session.scalar(select(func.count()).select_from(PageView)) or 0
    today_count = (
        await session.scalar(
            select(func.count()).select_from(PageView).where(PageView.view_date == today)
        )
        or 0
    )
    return total, today_count
