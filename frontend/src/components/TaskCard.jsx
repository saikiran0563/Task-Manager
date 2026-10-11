export default function TaskCard({ task, onUpdate, onDelete, onShare }) {
  const canEdit = task.is_owner || task.shared_role === "editor";
  const isOverdue = task.due_date
    && task.due_date < new Date().toISOString().slice(0, 10)
    && task.status !== "done";

  return (
    <article className={`task-card priority-${task.priority} status-${task.status}`}>
      <div className="task-main">
        <p className="task-title">{task.title}</p>
        {task.description && <p className="task-desc">{task.description}</p>}
        <div className="task-meta">
          <span className={`badge status-${task.status}`}>{task.status.replace("_", " ")}</span>
          <span className="priority-label">Priority: {task.priority}</span>
          {task.due_date && <span className={isOverdue ? "overdue-label" : ""}>{isOverdue ? "Overdue · " : "Due "}{task.due_date}</span>}
          {!task.is_owner && <span className="shared-label">Shared by {task.owner_name} · {task.shared_role}</span>}
        </div>
      </div>
      <div className="task-actions">
        <select
          aria-label={`Status for ${task.title}`}
          value={task.status}
          disabled={!canEdit}
          onChange={(event) => onUpdate(task.id, { status: event.target.value })}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="done">Completed</option>
        </select>
        <div className="task-action-row">
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
