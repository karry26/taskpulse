import { useState } from "react";
import { deleteTask, type Task } from "../api/tasks";
import type { Status } from "../types/task";
import { PRIORITY_META, STATUS_META, fmtDate } from "../utils/taskHelpers";
import "../styles/TaskCard.css";

interface Props {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: Props) {
  const p = PRIORITY_META[task.priority] ?? PRIORITY_META.MEDIUM;
  const s = STATUS_META[task.status as Status] ?? STATUS_META.PENDING;
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${task.title}"?`)) return;
    setDeleting(true);
    try {
      await deleteTask(task.id);
      onDelete(task.id);
    } catch {
      alert("Could not delete task.");
      setDeleting(false);
    }
  }

  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("taskId", task.id);
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      <div className="task-card-header">
        <span className={`badge ${p.cls}`}>{p.label}</span>
        <span className={`status-chip ${s.cls}`}>{s.label}</span>
      </div>
      <h3 className="task-title">{task.title}</h3>
      {task.description && <p className="task-desc">{task.description}</p>}
      <div className="task-meta">
        <span>Due: {fmtDate(task.dueDate)}</span>
        <span>Created: {fmtDate(task.createdAt)}</span>
      </div>
      <div className="task-actions">
        <button
          className="task-action-btn edit-btn"
          onClick={() => onEdit(task)}
          title="Edit task"
        >
          ✎ Edit
        </button>
        <button
          className="task-action-btn delete-btn"
          onClick={handleDelete}
          disabled={deleting}
          title="Delete task"
        >
          {deleting ? "…" : "✕ Delete"}
        </button>
      </div>
    </div>
  );
}
