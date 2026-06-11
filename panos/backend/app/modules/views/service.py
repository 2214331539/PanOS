import hashlib
import hmac
from datetime import UTC, datetime

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.modules.views import repository as repo
from app.modules.views.schemas import ViewCount, ViewSummary


def _client_ip(request: Request) -> str:
    # 反向代理（Railway/Vercel）场景优先取 X-Forwarded-For 首个地址。
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _hash_ip(ip: str) -> str:
    secret = get_settings().contact_rate_limit_secret.encode("utf-8")
    return hmac.new(secret, ip.encode("utf-8"), hashlib.sha256).hexdigest()[:32]


async def record_view(session: AsyncSession, request: Request, path: str) -> ViewCount:
    today = datetime.now(UTC).date()
    await repo.record(session, path=path, ip_hash=_hash_ip(_client_ip(request)), view_date=today)
    count = await repo.count_for_path(session, path)
    return ViewCount(path=path, count=count)


async def count_for_path(session: AsyncSession, path: str) -> int:
    return await repo.count_for_path(session, path)


async def summary(session: AsyncSession) -> ViewSummary:
    total, today = await repo.totals(session, today=datetime.now(UTC).date())
    return ViewSummary(total=total, today=today)
