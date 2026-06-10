import re
from uuid import uuid4


def slugify(value: str) -> str:
    """标题转 URL slug；归一化后为空时回退随机短 id。"""
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or uuid4().hex[:8]
