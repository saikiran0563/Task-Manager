export default function TaskCard({ task, onUpdate, onDelete }) {
  return (
    <div className={`task-card priority-${task.priority} status-${task.status}`}>
      <div className="task-main">
        <p className="task-title">{task.title}</p>
        {task.description && <p className="task-desc">{task.description}</p>}
        <div className="task-meta">
          <span className={`badge status-${task.status}`}>{task.status.replace("_", " ")}</span>
          <span>priority: {task.priority}</span>
          {task.due_date && <span>due {task.due_date}</span>}
        </div>
      </div>
      <div className="task-actions">
        <select
          value={task.status}
          onChange={(e) => onUpdate(task.id, { status: e.target.value })}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <button className="btn btn-danger" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}
