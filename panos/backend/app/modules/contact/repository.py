from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.content import ContactMessage


async def persist(session: AsyncSession, message: ContactMessage) -> ContactMessage:
    session.add(message)
    await session.commit()
    await session.refresh(message)
    return message
