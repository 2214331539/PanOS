from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    api_title: str = "PanOS API"
    api_version: str = "0.1.0"
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5440/panos"

    # 简约账号密码鉴权（V1 本地接缝，目标仍 Supabase Auth）。
    # 敏感配置一律必填、由环境变量 / .env 注入，仓库中不保留默认值
    # （本地开发：首次 ./dev.sh 自动生成 .env，或参照 .env.example 手动创建）。
    admin_username: str
    admin_password: str
    auth_secret: str
    auth_token_ttl_seconds: int = 86_400  # 24h

    # 本地图片存储（V1 接缝，目标仍 Supabase Storage）。
    upload_dir: str = "uploads"
    media_base_url: str = "http://localhost:8000/media"
    upload_max_bytes: int = 5 * 1024 * 1024  # 5MB

    supabase_url: str = ""
    supabase_jwt_issuer: str = ""
    supabase_jwks_url: str = ""
    supabase_service_role_key: str = ""
    supabase_storage_public_bucket: str = "panos-public-assets"
    supabase_storage_private_bucket: str = "panos-private-assets"
    contact_rate_limit_secret: str
    backend_cors_origins: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174",
        validation_alias="BACKEND_CORS_ORIGINS",
    )
    # 可选的 CORS 来源正则（本地开发用：Vite 端口被占用时会自动顺延，
    # 精确白名单会导致浏览器拦截 API 请求）。留空 = 仅用上面的精确白名单。
    backend_cors_origin_regex: str = Field(
        default="",
        validation_alias="BACKEND_CORS_ORIGIN_REGEX",
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

