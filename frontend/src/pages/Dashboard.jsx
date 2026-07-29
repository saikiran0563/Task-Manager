import { useEffect, useState } from "react";
import api from "../api/axios";
import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const res = await api.get("/tasks/", { params });
      setTasks(res.data);
      setError("");
    } catch (err) {
      setError("Could not load tasks. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleCreate = async (payload) => {
    const res = await api.post("/tasks/", payload);
    setTasks((prev) => [res.data, ...prev]);
  };

  const handleUpdate = async (id, payload) => {
    const res = await api.put(`/tasks/${id}`, payload);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
  };

  const handleDelete = async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Your tasks</h2>
        <div className="filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`filter-chip ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <TaskForm onCreate={handleCreate} />

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <span className="dot" />
          <p>No tasks here yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
