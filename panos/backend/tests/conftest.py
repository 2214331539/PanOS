import os

# 鉴权配置已无仓库内默认值（见 app/core/config.py），测试注入隔离值，
# 不依赖开发者本地 .env，CI 环境也能直接运行。
# 必须在 app 模块导入（触发 get_settings）之前设置。
os.environ.setdefault("ADMIN_USERNAME", "test-admin")
os.environ.setdefault("ADMIN_PASSWORD", "test-password")
os.environ.setdefault("AUTH_SECRET", "test-secret")
os.environ.setdefault("CONTACT_RATE_LIMIT_SECRET", "test-rate-limit-secret")
