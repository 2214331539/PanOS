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


def test_widgets_public() -> None:
    response = client.get("/api/widgets")

    assert response.status_code == 200
    types = [item["type"] for item in response.json()["data"]]
    assert "clock" in types
    assert "now" in types


def test_views_record_and_summary() -> None:
    with TestClient(app) as c:
        path = f"/articles/pytest-{uuid4().hex[:8]}"
        first = c.post("/api/views", json={"path": path})
        assert first.status_code == 201
        assert first.json()["data"]["count"] == 1

        # 同访客同天重复浏览不重复计数
        second = c.post("/api/views", json={"path": path})
        assert second.json()["data"]["count"] == 1

        summary = c.get("/api/views/summary")
        assert summary.status_code == 200
        assert summary.json()["data"]["total"] >= 1


def test_views_rejects_external_path() -> None:
    response = client.post("/api/views", json={"path": "https://evil.example.com"})

    assert response.status_code == 422


def test_calendar_public_month() -> None:
    response = client.get("/api/calendar?month=2026-06")

    assert response.status_code == 200
    titles = [item["title"] for item in response.json()["data"]]
    assert "PanOS 上线部署" in titles


def test_calendar_invalid_month() -> None:
    assert client.get("/api/calendar?month=junk").status_code == 422


def test_calendar_admin_roundtrip() -> None:
    with TestClient(app) as c:
        headers = {"Authorization": f"Bearer {_login_token(c)}"}
        no_auth = c.post("/api/admin/calendar", json={"date": "2030-01-02", "title": "x"})
        assert no_auth.status_code == 401

        created = c.post(
            "/api/admin/calendar",
            headers=headers,
            json={"date": "2030-01-02", "title": "pytest 计划"},
        )
        assert created.status_code == 201
        event = created.json()["data"]

        listed = c.get("/api/calendar?month=2030-01")
        assert event["id"] in [item["id"] for item in listed.json()["data"]]

        updated = c.patch(
            f"/api/admin/calendar/{event['id']}",
            headers=headers,
            json={"title": "pytest 计划（改）"},
        )
        assert updated.json()["data"]["title"] == "pytest 计划（改）"

        assert c.delete(f"/api/admin/calendar/{event['id']}", headers=headers).status_code == 204


def test_search_aggregates_types() -> None:
    response = client.get("/api/search?q=PanOS")

    assert response.status_code == 200
    types = {item["type"] for item in response.json()["data"]}
    # 种子数据里 PanOS 同时命中文章、项目与图库
    assert "project" in types
    assert "article" in types


def test_search_requires_query() -> None:
    assert client.get("/api/search").status_code == 422
    assert client.get("/api/search?q=").status_code == 422


def test_v2_public_endpoints() -> None:
    with TestClient(app) as c:
        ideas = c.get("/api/ideas")
        assert ideas.status_code == 200
        assert {item["status"] for item in ideas.json()["data"]} >= {"seed", "built"}

        research = c.get("/api/research")
        assert research.status_code == 200
        slugs = [item["slug"] for item in research.json()["data"]]
        assert "agent-memory-retrieval" in slugs

        detail = c.get("/api/research/agent-memory-retrieval")
        assert detail.status_code == 200
        assert detail.json()["data"]["bodyMdx"]

        timeline = c.get("/api/timeline")
        assert timeline.status_code == 200
        assert timeline.json()["data"][0]["date"] >= timeline.json()["data"][-1]["date"]

        filtered = c.get("/api/timeline?type=research")
        assert {item["type"] for item in filtered.json()["data"]} == {"research"}


def test_v2_admin_guards() -> None:
    for path in ("/api/admin/ideas", "/api/admin/research", "/api/admin/timeline"):
        assert client.get(path).status_code == 401
