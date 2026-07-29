import { useState } from "react";

export default function TaskForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="task-form-card" onSubmit={handleSubmit}>
      <div className="task-form-grid">
        <div className="field span-2">
          <label htmlFor="title">Task title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Write project README"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="priority">Priority</label>
          <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="due">Due date</label>
          <input
            id="due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>
      <div className="field" style={{ marginTop: 4 }}>
        <label htmlFor="desc">Description (optional)</label>
        <textarea
          id="desc"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Any extra detail..."
        />
      </div>
      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Adding..." : "Add task"}
      </button>
    </form>
  );
}
