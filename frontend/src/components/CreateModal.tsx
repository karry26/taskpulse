import { useState } from "react";
import { createTask, type Task } from "../api/tasks";
import { EMPTY_FORM } from "../utils/taskHelpers";
import type { Priority } from "../types/task";
import "../styles/Modal.css";

interface Props {
  onClose: () => void;
  onCreated: (t: Task) => void;
}

export default function CreateModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof EMPTY_FORM>(
    key: K,
    val: (typeof EMPTY_FORM)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");
    setLoading(true);
    setError(null);
    try {
      const created = await createTask(form);
      onCreated(created);
      onClose();
    } catch {
      setError("Could not create task. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Task</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            Title <span className="req">*</span>
            <input
              autoFocus
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Fix login bug"
            />
          </label>
          <label>
            Description
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional details…"
            />
          </label>
          <div className="form-row">
            <label>
              Priority
              <select
                value={form.priority}
                onChange={(e) => set("priority", e.target.value as Priority)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </label>
            <label>
              Due Date
              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
              />
            </label>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Creating…" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
