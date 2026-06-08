from fastapi import APIRouter, status

from app.modules.contact.schemas import ContactCreate, ContactCreated
from app.modules.contact.service import submit_contact_message
from app.schemas.responses import DataEnvelope

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=DataEnvelope[ContactCreated], status_code=status.HTTP_201_CREATED)
async def create_contact(payload: ContactCreate) -> DataEnvelope[ContactCreated]:
    data = await submit_contact_message(payload)
    return DataEnvelope(data=data)
