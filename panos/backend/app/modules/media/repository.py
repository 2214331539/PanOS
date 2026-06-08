from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.content import MediaAsset


async def save_media_asset(session: AsyncSession, asset: MediaAsset) -> MediaAsset:
    session.add(asset)
    await session.commit()
    await session.refresh(asset)
    return asset
