import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";
import SharePanel from "../components/SharePanel";

const FILTERS = [
  { key: "all", label: "All tasks" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Completed" },
];

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedShareTask, setSelectedShareTask] = useState(null);

  const loadTasks = async () => {
    try {
      const response = await api.get("/tasks/");
      setTasks(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Could not load tasks. Check whether the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const loadActivity = async () => {
    try {
      const response = await api.get("/tasks/activity", { params: { limit: 12 } });
      setActivity(response.data);
    } catch {
      setActivity([]);
    }
  };

  const refreshDashboard = async () => {
    await Promise.all([loadTasks(), loadActivity()]);
  };

  useEffect(() => {
    refreshDashboard();
    // Initial dashboard load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesStatus = filter === "all" || task.status === filter;
      const matchesSearch = !normalizedSearch
        || task.title.toLowerCase().includes(normalizedSearch)
        || (task.description || "").toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [tasks, filter, search]);

  const today = new Date().toISOString().slice(0, 10);
  const stats = useMemo(() => ({
    total: tasks.length,
    inProgress: tasks.filter((task) => task.status === "in_progress").length,
    completed: tasks.filter((task) => task.status === "done").length,
    overdue: tasks.filter((task) => task.due_date && task.due_date < today && task.status !== "done").length,
  }), [tasks, today]);

  const handleCreate = async (payload) => {
    try {
      const response = await api.post("/tasks/", payload);
      setTasks((current) => [response.data, ...current]);
      setError("");
      await loadActivity();
    } catch (err) {
      setError(err.response?.data?.error || "Could not create this task.");
      throw err;
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      const response = await api.put(`/tasks/${id}`, payload);
      setTasks((current) => current.map((task) => task.id === id ? response.data : task));
      setError("");
      await loadActivity();
    } catch (err) {
      setError(err.response?.data?.error || "Could not update this task.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((current) => current.filter((task) => task.id !== id));
      if (selectedShareTask?.id === id) setSelectedShareTask(null);
      setError("");
      await loadActivity();
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete this task.");
    }
  };

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Your workspace</p>
          <h1>Good to see you.</h1>
          <p className="subtitle">A clearer view of what needs your attention.</p>
        </div>
        <button className="btn btn-ghost" type="button" onClick={refreshDashboard}>Refresh data</button>
      </header>

      <section className="stats-grid" aria-label="Task overview">
        <article className="stat-card">
          <span className="stat-label">Total tasks</span>
          <strong className="stat-value">{stats.total}</strong>
          <div className="stat-note">Your accessible workspace</div>
        </article>
        <article className="stat-card">
          <span className="stat-label">In progress</span>
          <strong className="stat-value">{stats.inProgress}</strong>
          <div className="stat-note">Currently underway</div>
        </article>
        <article className="stat-card">
          <span className="stat-label">Completed</span>
          <strong className="stat-value">{stats.completed}</strong>
          <div className="stat-note">Finished tasks</div>
        </article>
        <article className="stat-card">
          <span className="stat-label">Overdue</span>
          <strong className="stat-value">{stats.overdue}</strong>
          <div className="stat-note">Past due and unfinished</div>
        </article>
      </section>

      {error && <div className="error-banner">{error}</div>}

      <div className="dashboard-grid">
        <section className="dashboard-main">
          <div className="section-heading">
            <div>
              <h2>Create a task</h2>
              <p>Capture the next thing you need to get done.</p>
            </div>
          </div>
          <TaskForm onCreate={handleCreate} />

          <div className="section-heading">
            <div>
              <h2>Your task board</h2>
              <p>{visibleTasks.length} shown · {tasks.length} total</p>
            </div>
          </div>
          <div className="task-toolbar">
            <div className="search-wrap">
              <input
                className="control-input"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search task title or description…"
                aria-label="Search tasks"
              />
            </div>
            <div className="filters" aria-label="Filter tasks by status">
              {FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`filter-chip ${filter === item.key ? "active" : ""}`}
                  onClick={() => setFilter(item.key)}
                  aria-pressed={filter === item.key}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="loading-text">Loading your tasks…</p>
          ) : visibleTasks.length === 0 ? (
            <div className="empty-state">
              <span className="dot" />
              <p>{tasks.length === 0 ? "Your board is ready. Add a task to get started." : "No tasks match this search or filter."}</p>
            </div>
          ) : (
            <div className="task-list">
              {visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onShare={setSelectedShareTask}
                />
              ))}
            </div>
          )}

          {selectedShareTask && (
            <SharePanel
              key={selectedShareTask.id}
              task={selectedShareTask}
              onClose={() => setSelectedShareTask(null)}
              onUpdated={refreshDashboard}
            />
          )}
        </section>

        <aside className="activity-panel">
          <h2>Recent activity</h2>
          <p className="panel-subtitle">A timeline of changes in your shared workspace.</p>
          {activity.length === 0 ? (
            <div className="activity-empty">Task updates will appear here as you work and collaborate.</div>
          ) : (
            <div className="activity-list">
              {activity.map((item) => (
                <article className="activity-item" key={item.id}>
                  <p className="activity-title">
                    <strong>{item.actor_name}</strong> {item.details.toLowerCase()}{" "}
                    {item.task_title && <>on <strong>{item.task_title}</strong></>}
                  </p>
                  <div className="activity-meta">{formatDate(item.created_at)}</div>
                </article>
              ))}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
