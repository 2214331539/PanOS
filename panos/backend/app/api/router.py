"""聚合各功能模块的 router，对外暴露统一的 /api 路由。

每个模块自带 router.py（垂直切片），此处只负责装配，不写业务逻辑。
"""

from fastapi import APIRouter

from app.modules.articles.router import router as articles_router
from app.modules.auth.router import router as auth_router
from app.modules.calendar.router import router as calendar_router
from app.modules.categories.router import router as categories_router
from app.modules.contact.router import router as contact_router
from app.modules.desktop.router import router as desktop_router
from app.modules.gallery.router import router as gallery_router
from app.modules.links.router import router as links_router
from app.modules.media.router import router as media_router
from app.modules.projects.router import router as projects_router
from app.modules.search.router import router as search_router
from app.modules.views.router import router as views_router
from app.modules.widgets.router import router as widgets_router

api_router = APIRouter(prefix="/api")
api_router.include_router(desktop_router)
api_router.include_router(links_router)
api_router.include_router(contact_router)
api_router.include_router(articles_router)
api_router.include_router(projects_router)
api_router.include_router(gallery_router)
api_router.include_router(categories_router)
api_router.include_router(widgets_router)
api_router.include_router(calendar_router)
api_router.include_router(search_router)
api_router.include_router(views_router)
api_router.include_router(media_router)
api_router.include_router(auth_router)
