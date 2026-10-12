import { useState } from "react";

export default function TaskForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        priority,
        due_date: dueDate || null,
      });
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
    } catch (err) {
      setError(err.response?.data?.error || "Could not add the task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="task-form-card" onSubmit={handleSubmit}>
      {error && <div className="error-banner">{error}</div>}
      <div className="task-form-grid">
        <div className="field span-2">
          <label htmlFor="task-title">Task title</label>
          <input
            id="task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Finish the project README"
            maxLength={200}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="task-priority">Priority</label>
          <select id="task-priority" value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="task-due-date">Due date</label>
          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="task-description">Description <span className="form-hint">(optional)</span></label>
        <textarea
          id="task-description"
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add context or a next step…"
        />
      </div>
      <div className="form-footer">
        <span className="form-hint">Keep it clear. You can edit the task later.</span>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Adding task…" : "+ Add task"}
        </button>
      </div>
    </form>
  );
}
