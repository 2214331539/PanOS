from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _login_token(c: TestClient) -> str:
    response = c.post(
        "/api/admin/login",
        json={"username": "test-admin", "password": "test-password"},
    )
    assert response.status_code == 200
    token: str = response.json()["data"]["accessToken"]
    return token


def test_projects_list_public() -> None:
    response = client.get("/api/projects")

    assert response.status_code == 200
    body = response.json()
    assert isinstance(body["data"], list)
    assert "total" in body["meta"]
    assert "ETag" in response.headers


def test_project_detail_not_found() -> None:
    response = client.get("/api/projects/definitely-missing-slug")

    assert response.status_code == 404


def test_gallery_list_public() -> None:
    response = client.get("/api/gallery")

    assert response.status_code == 200
    body = response.json()
    assert isinstance(body["data"], list)
    for item in body["data"]:
        assert item["media"]["url"]


def test_links_list_public() -> None:
    response = client.get("/api/links")

    assert response.status_code == 200
    assert isinstance(response.json()["data"], list)


def test_admin_resources_require_auth() -> None:
    for path in ("/api/admin/projects", "/api/admin/gallery", "/api/admin/links"):
        assert client.get(path).status_code == 401


def test_admin_project_crud_roundtrip() -> None:
    # 多次请求需共享同一事件循环（asyncpg 连接绑定循环），用 with 维持单个 portal。
    with TestClient(app) as c:
        _project_crud_roundtrip(c)


def _project_crud_roundtrip(c: TestClient) -> None:
    headers = {"Authorization": f"Bearer {_login_token(c)}"}
    slug = f"pytest-{uuid4().hex[:10]}"

    created = c.post(
        "/api/admin/projects",
        headers=headers,
        json={
            "name": "Pytest Project",
            "slug": slug,
            "tagline": "测试项目",
            "techStack": ["Python"],
            "links": [{"type": "github", "label": "GitHub", "url": "https://example.com"}],
        },
    )
    assert created.status_code == 201
    project = created.json()["data"]
    assert project["slug"] == slug
    assert project["links"][0]["label"] == "GitHub"

    public = c.get(f"/api/projects/{slug}")
    assert public.status_code == 200

    updated = c.patch(
        f"/api/admin/projects/{project['id']}",
        headers=headers,
        json={"status": "launched", "links": []},
    )
    assert updated.status_code == 200
    assert updated.json()["data"]["status"] == "launched"
    assert updated.json()["data"]["links"] == []

    deleted = c.delete(f"/api/admin/projects/{project['id']}", headers=headers)
    assert deleted.status_code == 204
    assert c.get(f"/api/projects/{slug}").status_code == 404


def test_admin_link_crud_roundtrip() -> None:
    with TestClient(app) as c:
        _link_crud_roundtrip(c)


def _link_crud_roundtrip(c: TestClient) -> None:
    headers = {"Authorization": f"Bearer {_login_token(c)}"}
    slug = f"pytest-{uuid4().hex[:10]}"

    created = c.post(
        "/api/admin/links",
        headers=headers,
        json={
            "platform": "Pytest",
            "slug": slug,
            "description": "测试链接",
            "url": "https://example.com",
        },
    )
    assert created.status_code == 201
    link = created.json()["data"]

    hidden = c.patch(
        f"/api/admin/links/{link['id']}",
        headers=headers,
        json={"isActive": False},
    )
    assert hidden.status_code == 200
    assert hidden.json()["data"]["isActive"] is False

    public_ids = [item["id"] for item in c.get("/api/links").json()["data"]]
    assert link["id"] not in public_ids

    assert c.delete(f"/api/admin/links/{link['id']}", headers=headers).status_code == 204
