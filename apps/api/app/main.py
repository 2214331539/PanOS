from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.admin.me import router as admin_me_router
from app.api.routes.public.contact import router as contact_router
from app.api.routes.public.desktop import router as desktop_router
from app.api.routes.public.links import router as links_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title=settings.api_title, version=settings.api_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

api_router = APIRouter(prefix="/api")
api_router.include_router(desktop_router)
api_router.include_router(links_router)
api_router.include_router(contact_router)
api_router.include_router(admin_me_router)

app.include_router(api_router)


@app.get("/", include_in_schema=False)
async def root() -> dict[str, str]:
    return {"name": "PanOS API", "status": "running"}

