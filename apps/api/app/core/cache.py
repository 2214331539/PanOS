from collections.abc import Mapping
from hashlib import sha256

from fastapi import Response


def build_etag(value: str) -> str:
    return sha256(value.encode("utf-8")).hexdigest()


def apply_public_cache(response: Response, etag_source: str, max_age: int = 60) -> None:
    response.headers["Cache-Control"] = f"public, max-age={max_age}, stale-while-revalidate=300"
    response.headers["ETag"] = build_etag(etag_source)


def apply_no_store(response: Response) -> None:
    response.headers["Cache-Control"] = "no-store"


def cache_headers(etag_source: str, max_age: int = 60) -> Mapping[str, str]:
    return {
        "Cache-Control": f"public, max-age={max_age}, stale-while-revalidate=300",
        "ETag": build_etag(etag_source),
    }

