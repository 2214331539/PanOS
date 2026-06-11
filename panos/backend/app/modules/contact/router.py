from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.modules.contact.schemas import ContactCreate, ContactCreated
from app.modules.contact.service import submit_contact_message
from app.schemas.responses import DataEnvelope

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=DataEnvelope[ContactCreated], status_code=status.HTTP_201_CREATED)
async def create_contact(
    payload: ContactCreate,
    session: AsyncSession = Depends(get_session),
) -> DataEnvelope[ContactCreated]:
    data = await submit_contact_message(session, payload)
    return DataEnvelope(data=data)
