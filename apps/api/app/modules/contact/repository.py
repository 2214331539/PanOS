from uuid import uuid4

from app.modules.contact.schemas import ContactCreate, ContactCreated


async def create_contact_message(payload: ContactCreate) -> ContactCreated:
    _ = payload
    return ContactCreated(id=str(uuid4()), status="new")

