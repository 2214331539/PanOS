"""业务错误的统一构造，detail 固定为 {"error": {"code", "message"}} 信封。"""

from fastapi import HTTPException, status


def api_error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(
        status_code=status_code, detail={"error": {"code": code, "message": message}}
    )


def slug_conflict(slug: str) -> HTTPException:
    return api_error(status.HTTP_409_CONFLICT, "SLUG_CONFLICT", f"slug 已存在：{slug}")


def not_found(message: str) -> HTTPException:
    return api_error(status.HTTP_404_NOT_FOUND, "NOT_FOUND", message)
