"""聚合各功能模块的 router，对外暴露统一的 /api 路由。

每个模块自带 router.py（垂直切片），此处只负责装配，不写业务逻辑。
"""

from fastapi import APIRouter

from app.modules.auth.router import router as auth_router
from app.modules.contact.router import router as contact_router
from app.modules.desktop.router import router as desktop_router
from app.modules.links.router import router as links_router

api_router = APIRouter(prefix="/api")
api_router.include_router(desktop_router)
api_router.include_router(links_router)
api_router.include_router(contact_router)
api_router.include_router(auth_router)
