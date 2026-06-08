import hashlib
from abc import ABC, abstractmethod
from pathlib import Path

from app.core.config import get_settings


class StorageAdapter(ABC):
    """存储接缝：LocalStorage（V1 本地）/ SupabaseStorage（later）。"""

    @abstractmethod
    def save(self, data: bytes, ext: str, subdir: str) -> tuple[str, str]:
        """落盘并返回 (相对路径, 公开 URL)。"""


class LocalStorage(StorageAdapter):
    def save(self, data: bytes, ext: str, subdir: str) -> tuple[str, str]:
        settings = get_settings()
        digest = hashlib.sha256(data).hexdigest()[:16]
        rel_path = f"{subdir}/{digest}{ext}"
        dest = Path(settings.upload_dir) / rel_path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        return rel_path, f"{settings.media_base_url}/{rel_path}"


def get_storage() -> StorageAdapter:
    # 未来按 settings 切换到 SupabaseStorage，业务层无感。
    return LocalStorage()
