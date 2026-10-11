import { useState } from "react";

export default function TaskCard({ task, onUpdate, onDelete, onShare }) {
  const canEdit = task.is_owner || task.shared_role === "editor";
  const isOverdue = task.due_date
    && task.due_date < new Date().toISOString().slice(0, 10)
    && task.status !== "done";
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    due_date: task.due_date || "",
  });

  const startEditing = () => {
    setDraft({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      due_date: task.due_date || "",
    });
    setEditing(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!draft.title.trim()) return;
    setSaving(true);
    try {
      const saved = await onUpdate(task.id, {
        title: draft.title.trim(),
        description: draft.description.trim(),
        priority: draft.priority,
        due_date: draft.due_date || null,
      });
      if (saved) setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className={`task-card priority-${task.priority} status-${task.status}`}>
      <div className="task-main">
        {editing ? (
          <form className="task-edit-form" onSubmit={handleSave}>
            <div className="field">
              <label htmlFor={`edit-title-${task.id}`}>Title</label>
              <input
                id={`edit-title-${task.id}`}
                value={draft.title}
                maxLength={200}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor={`edit-description-${task.id}`}>Description</label>
              <textarea
                id={`edit-description-${task.id}`}
                rows={2}
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              />
            </div>
            <div className="task-edit-grid">
              <div className="field">
                <label htmlFor={`edit-priority-${task.id}`}>Priority</label>
                <select
                  id={`edit-priority-${task.id}`}
                  value={draft.priority}
                  onChange={(event) => setDraft({ ...draft, priority: event.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor={`edit-due-${task.id}`}>Due date</label>
                <input
                  id={`edit-due-${task.id}`}
                  type="date"
                  value={draft.due_date}
                  onChange={(event) => setDraft({ ...draft, due_date: event.target.value })}
                />
              </div>
            </div>
            <div className="task-action-row">
              <button className="btn btn-primary btn-small" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button className="btn btn-ghost btn-small" type="button" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="task-title">{task.title}</p>
            {task.description && <p className="task-desc">{task.description}</p>}
            <div className="task-meta">
              <span className={`badge status-${task.status}`}>{task.status.replace("_", " ")}</span>
              <span className="priority-label">Priority: {task.priority}</span>
              {task.due_date && <span className={isOverdue ? "overdue-label" : ""}>{isOverdue ? "Overdue · " : "Due "}{task.due_date}</span>}
              {!task.is_owner && <span className="shared-label">Shared by {task.owner_name} · {task.shared_role}</span>}
            </div>
          </>
        )}
      </div>
      <div className="task-actions">
        <select
          aria-label={`Status for ${task.title}`}
          value={task.status}
          disabled={!canEdit || editing}
          onChange={(event) => onUpdate(task.id, { status: event.target.value })}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="done">Completed</option>
        </select>
        <div className="task-action-row">
          {canEdit && !editing && (
            <button className="btn btn-ghost btn-small" type="button" onClick={startEditing}>
              Edit
            </button>
          )}
          {task.is_owner && (
            <button className="btn btn-ghost btn-small" type="button" onClick={() => onShare(task)}>
              Share
            </button>
          )}
          {task.is_owner && (
            <button className="btn btn-danger btn-small" type="button" onClick={() => onDelete(task.id)}>
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
