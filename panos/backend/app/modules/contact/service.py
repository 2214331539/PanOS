from app.modules.contact.repository import create_contact_message
from app.modules.contact.schemas import ContactCreate, ContactCreated


async def submit_contact_message(payload: ContactCreate) -> ContactCreated:
    return await create_contact_message(payload)

