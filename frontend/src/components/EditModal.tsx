import { useState } from "react";
import { updateTask } from "../api";
import type { Task, UpdateTaskBody } from "../api";
import type { Priority, Status } from "../types/task";
import "../styles/Modal.css";

type EditForm = UpdateTaskBody & { title: string };

interface Props {
  task: Task;
  onClose: () => void;
  onUpdated: (t: Task) => void;
}

export default function EditModal({ task, onClose, onUpdated }: Props) {
  const [form, setForm] = useState<EditForm>({
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ? task.dueDate.slice(0, 16) : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof EditForm>(key: K, val: EditForm[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");
    setLoading(true);
    setError(null);
    try {
      const updated = await updateTask(task.id, form);
      onUpdated(updated);
      onClose();
    } catch {
      setError("Could not update task.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Task</h2>
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
            />
          </label>
          <label>
            Description
            <textarea
              rows={3}
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
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
              Status
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as Status)}
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </label>
          </div>
          <label>
            Due Date
            <input
              type="datetime-local"
              value={form.dueDate ?? ""}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </label>
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
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
