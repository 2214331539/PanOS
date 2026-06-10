from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title=settings.api_title, version=settings.api_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.backend_cors_origin_regex or None,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(api_router)

# 本地上传图片的静态服务（V1；目标仍 Supabase Storage）。
app.mount("/media", StaticFiles(directory=settings.upload_dir, check_dir=False), name="media")


@app.get("/", include_in_schema=False)
async def root() -> dict[str, str]:
    return {"name": "PanOS API", "status": "running"}
