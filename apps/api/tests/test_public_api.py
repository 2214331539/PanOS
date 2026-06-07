from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_desktop_bootstrap() -> None:
    response = client.get("/api/desktop/bootstrap")

    assert response.status_code == 200
    body = response.json()
    assert body["data"]["profile"]["englishName"] == "Pan Daniel"
    assert body["data"]["latest"]["articles"] == []


def test_contact_validation() -> None:
    response = client.post(
        "/api/contact",
        json={
            "name": "Visitor",
            "email": "visitor@example.com",
            "topic": "Research collaboration",
            "message": "你好，我想交流一下 PanOS 项目。",
        },
    )

    assert response.status_code == 201
    assert response.json()["data"]["status"] == "new"

