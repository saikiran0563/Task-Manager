from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models import Task

task_bp = Blueprint("tasks", __name__, url_prefix="/api/tasks")

VALID_STATUS = {"pending", "in_progress", "done"}
VALID_PRIORITY = {"low", "medium", "high"}


def _parse_due_date(value):
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


@task_bp.get("")
def list_tasks_no_slash():
    return list_tasks()


@task_bp.get("/")
@jwt_required()
def list_tasks():
    user_id = int(get_jwt_identity())
    status = request.args.get("status")
    query = Task.query.filter_by(user_id=user_id)
    if status and status in VALID_STATUS:
        query = query.filter_by(status=status)
    tasks = query.order_by(Task.created_at.desc()).all()
    return jsonify([t.to_dict() for t in tasks]), 200


@task_bp.post("/")
@jwt_required()
def create_task():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"error": "title is required"}), 400

    task = Task(
        title=title,
        description=(data.get("description") or "").strip(),
        status=data.get("status") if data.get("status") in VALID_STATUS else "pending",
        priority=data.get("priority") if data.get("priority") in VALID_PRIORITY else "medium",
        due_date=_parse_due_date(data.get("due_date")),
        user_id=user_id,
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


@task_bp.get("/<int:task_id>")
@jwt_required()
def get_task(task_id):
    user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=task_id, user_id=user_id).first_or_404()
    return jsonify(task.to_dict()), 200


@task_bp.put("/<int:task_id>")
@jwt_required()
def update_task(task_id):
    user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=task_id, user_id=user_id).first_or_404()
    data = request.get_json(silent=True) or {}

    if "title" in data:
        title = (data.get("title") or "").strip()
        if not title:
            return jsonify({"error": "title cannot be empty"}), 400
        task.title = title
    if "description" in data:
        task.description = (data.get("description") or "").strip()
    if "status" in data and data["status"] in VALID_STATUS:
        task.status = data["status"]
    if "priority" in data and data["priority"] in VALID_PRIORITY:
        task.priority = data["priority"]
    if "due_date" in data:
        task.due_date = _parse_due_date(data.get("due_date"))

    db.session.commit()
    return jsonify(task.to_dict()), 200


@task_bp.delete("/<int:task_id>")
@jwt_required()
def delete_task(task_id):
    user_id = int(get_jwt_identity())
    task = Task.query.filter_by(id=task_id, user_id=user_id).first_or_404()
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "task deleted"}), 200
