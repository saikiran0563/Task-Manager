from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_, or_

from extensions import db
from models import ActivityLog, Task, TaskShare, User

task_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")
VALID_STATUS = {"pending", "in_progress", "done"}
VALID_PRIORITY = {"low", "medium", "high"}
VALID_SHARE_ROLES = {"viewer", "editor"}


def _parse_due_date(value):
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


def _log_activity(task, actor_id, action, details):
    db.session.add(
        ActivityLog(
            task_id=task.id,
            task_title=task.title,
            actor_id=actor_id,
            action=action,
            details=details,
        )
    )


def _accessible_task_query(user_id):
    return Task.query.filter(
        or_(
            Task.user_id == user_id,
            Task.shares.any(TaskShare.shared_with_user_id == user_id),
        )
    )


def _task_for_user(task_id, user_id):
    return _accessible_task_query(user_id).filter(Task.id == task_id).first_or_404()


def _share_for_user(task_id, user_id):
    return TaskShare.query.filter_by(
        task_id=task_id, shared_with_user_id=user_id
    ).first()


def _can_edit(task, user_id):
    if task.user_id == user_id:
        return True
    share = _share_for_user(task.id, user_id)
    return bool(share and share.role == "editor")


def _serialize_task(task, user_id):
    result = task.to_dict()
    result["owner_name"] = task.owner.name
    result["is_owner"] = task.user_id == user_id
    share = _share_for_user(task.id, user_id)
    result["shared_role"] = share.role if share else None
    return result


@task_bp.get("")
@jwt_required()
def list_tasks_no_slash():
    return list_tasks()


@task_bp.get("/")
@jwt_required()
def list_tasks():
    user_id = int(get_jwt_identity())
    status = request.args.get("status", "").strip()
    search = request.args.get("q", "").strip()
    if status and status not in VALID_STATUS:
        return jsonify({"error": "invalid task status"}), 400

    query = _accessible_task_query(user_id)
    if status:
        query = query.filter(Task.status == status)
    if search:
        query = query.filter(Task.title.ilike(f"%{search}%"))
    tasks = query.order_by(Task.created_at.desc()).all()
    return jsonify([_serialize_task(task, user_id) for task in tasks]), 200


@task_bp.post("/")
@jwt_required()
def create_task():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "a JSON object is required"}), 400

    if not isinstance(data.get("title"), str):
        return jsonify({"error": "title must be a string"}), 400
    title = data["title"].strip()
    if not title:
        return jsonify({"error": "title is required"}), 400
    if not isinstance(data.get("description", ""), str):
        return jsonify({"error": "description must be a string"}), 400
    if len(title) > 200:
        return jsonify({"error": "title must be 200 characters or fewer"}), 400

    status = data.get("status", "pending")
    priority = data.get("priority", "medium")
    if not isinstance(status, str) or status not in VALID_STATUS:
        return jsonify({"error": "invalid task status"}), 400
    if not isinstance(priority, str) or priority not in VALID_PRIORITY:
        return jsonify({"error": "invalid task priority"}), 400

    due_value = data.get("due_date")
    due_date = _parse_due_date(due_value)
    if due_value and due_date is None:
        return jsonify({"error": "due_date must use YYYY-MM-DD format"}), 400

    task = Task(
        title=title,
        description=(data.get("description") or "").strip(),
        status=status,
        priority=priority,
        due_date=due_date,
        user_id=user_id,
    )
    db.session.add(task)
    db.session.flush()
    _log_activity(task, user_id, "created", "Created this task")
    db.session.commit()
    return jsonify(_serialize_task(task, user_id)), 201


@task_bp.get("/<int:task_id>")
@jwt_required()
def get_task(task_id):
    user_id = int(get_jwt_identity())
    task = _task_for_user(task_id, user_id)
    return jsonify(_serialize_task(task, user_id)), 200


@task_bp.put("/<int:task_id>")
@jwt_required()
def update_task(task_id):
    user_id = int(get_jwt_identity())
    task = _task_for_user(task_id, user_id)
    if not _can_edit(task, user_id):
        return jsonify({"error": "you have viewer access to this task"}), 403

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "a JSON object is required"}), 400

    changed = []
    if "title" in data:
        if not isinstance(data.get("title"), str):
            return jsonify({"error": "title must be a string"}), 400
        title = data["title"].strip()
        if not title:
            return jsonify({"error": "title cannot be empty"}), 400
        if len(title) > 200:
            return jsonify({"error": "title must be 200 characters or fewer"}), 400
        if title != task.title:
            task.title = title
            changed.append("title")
    if "description" in data:
        if not isinstance(data.get("description"), str):
            return jsonify({"error": "description must be a string"}), 400
        description = data["description"].strip()
        if description != (task.description or ""):
            task.description = description
            changed.append("description")
    if "status" in data:
        if not isinstance(data["status"], str) or data["status"] not in VALID_STATUS:
            return jsonify({"error": "invalid task status"}), 400
        if data["status"] != task.status:
            task.status = data["status"]
            changed.append("status")
    if "priority" in data:
        if not isinstance(data["priority"], str) or data["priority"] not in VALID_PRIORITY:
            return jsonify({"error": "invalid task priority"}), 400
        if data["priority"] != task.priority:
            task.priority = data["priority"]
            changed.append("priority")
    if "due_date" in data:
        due_value = data.get("due_date")
        due_date = _parse_due_date(due_value)
        if due_value and due_date is None:
            return jsonify({"error": "due_date must use YYYY-MM-DD format"}), 400
        if due_date != task.due_date:
            task.due_date = due_date
            changed.append("due date")

    if changed:
        _log_activity(task, user_id, "updated", "Updated " + ", ".join(changed))
    db.session.commit()
    return jsonify(_serialize_task(task, user_id)), 200


@task_bp.delete("/<int:task_id>")
@jwt_required()
def delete_task(task_id):
    user_id = int(get_jwt_identity())
    task = _task_for_user(task_id, user_id)
    if task.user_id != user_id:
        return jsonify({"error": "only the task owner can delete it"}), 403

    _log_activity(task, user_id, "deleted", "Deleted this task")
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "task deleted"}), 200


@task_bp.get("/<int:task_id>/shares")
@jwt_required()
def list_task_shares(task_id):
    user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=task_id, user_id=user_id).first_or_404()
    shares = TaskShare.query.filter_by(task_id=task.id).all()
    return jsonify([
        {
            "id": share.id,
            "user_id": share.shared_with_user_id,
            "name": share.shared_with.name,
            "email": share.shared_with.email,
            "role": share.role,
            "created_at": share.created_at.isoformat(),
        }
        for share in shares
    ]), 200


@task_bp.post("/<int:task_id>/shares")
@jwt_required()
def share_task(task_id):
    user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=task_id, user_id=user_id).first_or_404()
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "a JSON object is required"}), 400

    if not isinstance(data.get("email"), str):
        return jsonify({"error": "collaborator email must be a string"}), 400
    email = data["email"].strip().lower()
    role = data.get("role", "viewer")
    if not email:
        return jsonify({"error": "collaborator email is required"}), 400
    if not isinstance(role, str) or role not in VALID_SHARE_ROLES:
        return jsonify({"error": "role must be viewer or editor"}), 400

    collaborator = User.query.filter_by(email=email).first()
    if not collaborator:
        return jsonify({"error": "that user must register before you can share a task"}), 404
    if collaborator.id == user_id:
        return jsonify({"error": "you already own this task"}), 400

    share = TaskShare.query.filter_by(
        task_id=task.id, shared_with_user_id=collaborator.id
    ).first()
    if share:
        share.role = role
        action = "permission_changed"
        details = f"Changed {collaborator.name}'s access to {role}"
    else:
        share = TaskShare(task_id=task.id, shared_with_user_id=collaborator.id, role=role)
        db.session.add(share)
        action = "shared"
        details = f"Shared with {collaborator.name} as {role}"

    _log_activity(task, user_id, action, details)
    db.session.commit()
    return jsonify({
        "id": share.id,
        "user_id": collaborator.id,
        "name": collaborator.name,
        "email": collaborator.email,
        "role": share.role,
        "created_at": share.created_at.isoformat(),
    }), 200 if action == "permission_changed" else 201


@task_bp.delete("/<int:task_id>/shares/<int:share_id>")
@jwt_required()
def remove_task_share(task_id, share_id):
    user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=task_id, user_id=user_id).first_or_404()
    share = TaskShare.query.filter_by(id=share_id, task_id=task.id).first_or_404()
    collaborator_name = share.shared_with.name
    db.session.delete(share)
    _log_activity(task, user_id, "unshared", f"Removed {collaborator_name}'s access")
    db.session.commit()
    return jsonify({"message": "collaborator removed"}), 200


@task_bp.get("/activity")
@jwt_required()
def list_activity():
    user_id = int(get_jwt_identity())
    query = ActivityLog.query.outerjoin(Task, ActivityLog.task_id == Task.id).filter(
        or_(
            Task.user_id == user_id,
            Task.shares.any(TaskShare.shared_with_user_id == user_id),
            and_(ActivityLog.task_id.is_(None), ActivityLog.actor_id == user_id),
        )
    )
    limit = request.args.get("limit", default=20, type=int)
    limit = max(1, min(limit or 20, 100))
    activities = query.order_by(ActivityLog.created_at.desc()).limit(limit).all()
    return jsonify([
        {
            "id": item.id,
            "task_id": item.task_id,
            "task_title": item.task_title,
            "actor_name": item.actor.name if item.actor else "Former user",
            "action": item.action,
            "details": item.details,
            "created_at": item.created_at.isoformat(),
        }
        for item in activities
    ]), 200
