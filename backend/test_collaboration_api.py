import os

# Use an isolated in-memory database when importing the Flask app for tests.
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET_KEY"] = "task-manager-tests-secret-key-at-least-32-bytes"

import pytest

from app import app
from extensions import db


@pytest.fixture()
def client():
    app.config.update(TESTING=True, JWT_SECRET_KEY="task-manager-tests-secret-key-at-least-32-bytes")
    with app.app_context():
        db.drop_all()
        db.create_all()
    with app.test_client() as test_client:
        yield test_client
    with app.app_context():
        db.session.remove()
        db.drop_all()


def register(client, name, email):
    response = client.post(
        "/api/auth/register",
        json={"name": name, "email": email, "password": "secure-pass-123"},
    )
    assert response.status_code == 201
    return response.get_json()["token"]


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def create_task(client, token, title="Prepare portfolio"):
    response = client.post(
        "/api/tasks/",
        headers=auth(token),
        json={"title": title, "description": "Project work", "priority": "medium"},
    )
    assert response.status_code == 201
    return response.get_json()


def test_owner_can_share_task_with_viewer_and_editor(client):
    owner_token = register(client, "Owner", "owner@example.com")
    collaborator_token = register(client, "Collaborator", "collab@example.com")
    task = create_task(client, owner_token)

    share_response = client.post(
        f"/api/tasks/{task['id']}/shares",
        headers=auth(owner_token),
        json={"email": "collab@example.com", "role": "viewer"},
    )
    assert share_response.status_code == 201
    assert share_response.get_json()["role"] == "viewer"

    collaborator_tasks = client.get("/api/tasks/", headers=auth(collaborator_token))
    assert collaborator_tasks.status_code == 200
    assert collaborator_tasks.get_json()[0]["title"] == "Prepare portfolio"

    denied_update = client.put(
        f"/api/tasks/{task['id']}",
        headers=auth(collaborator_token),
        json={"status": "done"},
    )
    assert denied_update.status_code == 403

    editor_response = client.post(
        f"/api/tasks/{task['id']}/shares",
        headers=auth(owner_token),
        json={"email": "collab@example.com", "role": "editor"},
    )
    assert editor_response.status_code == 200
    assert editor_response.get_json()["role"] == "editor"

    allowed_update = client.put(
        f"/api/tasks/{task['id']}",
        headers=auth(collaborator_token),
        json={"status": "done"},
    )
    assert allowed_update.status_code == 200
    assert allowed_update.get_json()["status"] == "done"

    denied_delete = client.delete(
        f"/api/tasks/{task['id']}", headers=auth(collaborator_token)
    )
    assert denied_delete.status_code == 403


def test_only_owner_can_manage_shares(client):
    owner_token = register(client, "Owner", "owner@example.com")
    collaborator_token = register(client, "Collaborator", "collab@example.com")
    task = create_task(client, owner_token)
    client.post(
        f"/api/tasks/{task['id']}/shares",
        headers=auth(owner_token),
        json={"email": "collab@example.com", "role": "viewer"},
    )

    response = client.get(
        f"/api/tasks/{task['id']}/shares", headers=auth(collaborator_token)
    )
    assert response.status_code == 404


def test_invalid_due_date_is_rejected(client):
    token = register(client, "Owner", "owner@example.com")
    response = client.post(
        "/api/tasks/",
        headers=auth(token),
        json={"title": "Bad date", "due_date": "tomorrow"},
    )
    assert response.status_code == 400
    assert "YYYY-MM-DD" in response.get_json()["error"]


def test_activity_feed_is_scoped_to_accessible_tasks(client):
    owner_token = register(client, "Owner", "owner@example.com")
    stranger_token = register(client, "Stranger", "stranger@example.com")
    create_task(client, owner_token, "Private task")

    owner_activity = client.get("/api/tasks/activity", headers=auth(owner_token))
    stranger_activity = client.get("/api/tasks/activity", headers=auth(stranger_token))

    assert owner_activity.status_code == 200
    assert any(item["task_title"] == "Private task" for item in owner_activity.get_json())
    assert stranger_activity.status_code == 200
    assert stranger_activity.get_json() == []
