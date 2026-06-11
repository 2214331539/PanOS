import os

# 鉴权配置已无仓库内默认值（见 app/core/config.py），测试注入隔离值，
# 不依赖开发者本地 .env，CI 环境也能直接运行。
# 必须在 app 模块导入（触发 get_settings）之前设置。
os.environ.setdefault("ADMIN_USERNAME", "test-admin")
os.environ.setdefault("ADMIN_PASSWORD", "test-password")
os.environ.setdefault("AUTH_SECRET", "test-secret")
os.environ.setdefault("CONTACT_RATE_LIMIT_SECRET", "test-rate-limit-secret")

import asyncio  # noqa: E402

import pytest  # noqa: E402

from app.db.session import engine  # noqa: E402


@pytest.fixture(autouse=True)
def dispose_db_engine() -> object:
    """TestClient 每个请求用独立事件循环；asyncpg 连接绑定创建时的循环，
    测试结束后清空连接池，避免跨循环复用报 RuntimeError。"""
    yield
    asyncio.run(engine.dispose())
