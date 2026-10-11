import { useEffect, useState } from "react";
import api from "../api/axios";

export default function SharePanel({ task, onClose, onUpdated }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadShares = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/tasks/${task.id}/shares`);
      setShares(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Could not load collaborators.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShares();
    // The panel is keyed by task ID in the parent, so load once per selected task.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  const handleShare = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      await api.post(`/tasks/${task.id}/shares`, { email, role });
      setEmail("");
      setNotice("Collaboration access saved.");
      await loadShares();
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.error || "Could not share this task.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (shareId) => {
    setError("");
    setNotice("");
    try {
      await api.delete(`/tasks/${task.id}/shares/${shareId}`);
      setShares((current) => current.filter((share) => share.id !== shareId));
      setNotice("Collaborator access removed.");
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.error || "Could not remove this collaborator.");
    }
  };

  return (
    <section className="share-panel">
      <div className="section-heading">
        <div>
          <h2>Share task</h2>
          <p>Invite an existing Task Manager user to collaborate on “{task.title}”.</p>
        </div>
        <button className="btn btn-ghost btn-small" type="button" onClick={onClose}>Close</button>
      </div>
      {error && <div className="error-banner">{error}</div>}
      {notice && <div className="success-banner">{notice}</div>}
      <form className="share-form" onSubmit={handleShare}>
        <div className="field">
          <label htmlFor="collaborator-email">Account email</label>
          <input
            id="collaborator-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teammate@example.com"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="collaborator-role">Permission</label>
          <select id="collaborator-role" value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
        </div>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Share task"}
        </button>
      </form>
      <div className="section-heading" style={{ marginTop: 22 }}>
        <h2>People with access</h2>
      </div>
      {loading ? <p className="loading-text">Loading collaborators…</p> : shares.length === 0 ? (
        <p className="activity-empty">This task has not been shared yet.</p>
      ) : (
        <ul className="collaborator-list">
          {shares.map((share) => (
            <li className="collaborator-item" key={share.id}>
              <div>
                <div className="collaborator-name">{share.name}</div>
                <div className="collaborator-email">{share.email}</div>
                <div className="collaborator-role">{share.role}</div>
              </div>
              <button className="btn btn-danger btn-small" type="button" onClick={() => handleRemove(share.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
