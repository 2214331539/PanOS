from app.core.security import create_access_token, verify_credentials
from app.modules.auth.schemas import LoginRequest, LoginResult


def login(payload: LoginRequest) -> LoginResult | None:
    """校验账号密码，成功返回签发的 access token。失败返回 None。"""
    if not verify_credentials(payload.username, payload.password):
        return None
    token, expires_at = create_access_token()
    return LoginResult(access_token=token, expires_at=expires_at)
