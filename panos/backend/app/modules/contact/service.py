from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.content import ContactMessage
from app.modules.contact import repository as repo
from app.modules.contact.schemas import ContactCreate, ContactCreated


async def submit_contact_message(
    session: AsyncSession, payload: ContactCreate
) -> ContactCreated:
    message = await repo.persist(
        session,
        ContactMessage(
            name=payload.name,
            email=payload.email,
            topic=payload.topic,
            message=payload.message,
        ),
    )
    return ContactCreated(id=str(message.id), status=message.status.value)
