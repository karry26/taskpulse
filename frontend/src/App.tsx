import { useState, useEffect, useCallback } from "react";
import "./index.css";
import AuthPage from "./AuthPage";
import {
  getToken,
  clearToken,
  fetchTasks,
  createTask,
  AuthError,
  type Task,
  type CreateTaskBody,
} from "./api";

// ─── Constants ────────────────────────────────────────────────────────────────

type Priority = "LOW" | "MEDIUM" | "HIGH";
type Status = "PENDING" | "IN_PROGRESS" | "DONE";

const EMPTY_FORM: CreateTaskBody = {
  title: "",
  description: "",
  priority: "MEDIUM",
  dueDate: "",
};

// ─── Small helpers ────────────────────────────────────────────────────────────

const PRIORITY_META: Record<Priority, { label: string; cls: string }> = {
  LOW: { label: "Low", cls: "badge-low" },
  MEDIUM: { label: "Medium", cls: "badge-medium" },
  HIGH: { label: "High", cls: "badge-high" },
};

const STATUS_META: Record<Status, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "status-pending" },
  IN_PROGRESS: { label: "In Progress", cls: "status-in_progress" },
  DONE: { label: "Done", cls: "status-done" },
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task }: { task: Task }) {
  const p = PRIORITY_META[task.priority] ?? PRIORITY_META.MEDIUM;
  const s = STATUS_META[task.status] ?? STATUS_META.PENDING;
  return (
    <div className="task-card">
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
    </div>
  );
}

// ─── Create Task Modal ────────────────────────────────────────────────────────

function CreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (t: Task) => void;
}) {
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

// ─── App ──────────────────────────────────────────────────────────────────────

type FilterStatus = "ALL" | Status;

export default function App() {
  const [authed, setAuthed] = useState<boolean>(() => !!getToken());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setModal] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  function handleLogout() {
    clearToken();
    setAuthed(false);
    setTasks([]);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await fetchTasks());
    } catch (err) {
      if (err instanceof AuthError) {
        handleLogout();
      } else {
        setError("Could not load tasks. Make sure the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  if (!authed) {
    return (
      <AuthPage
        onAuth={() => {
          setAuthed(true);
        }}
      />
    );
  }

  const visible =
    filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);

  const counts: Record<string, number> = { ALL: tasks.length };
  for (const t of tasks) counts[t.status] = (counts[t.status] ?? 0) + 1;

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">TaskPulse</span>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setModal(true)}>
            + New Task
          </button>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Filter bar */}
      <div className="filter-bar">
        {(["ALL", "PENDING", "IN_PROGRESS", "DONE"] as FilterStatus[]).map(
          (s) => (
            <button
              key={s}
              className={`filter-btn${filter === s ? " active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s === "ALL" ? "All" : STATUS_META[s as Status].label}
              <span className="filter-count">{counts[s] ?? 0}</span>
            </button>
          ),
        )}
        <button
          className="btn btn-ghost refresh-btn"
          onClick={load}
          title="Refresh"
        >
          ↻
        </button>
      </div>

      {/* Content */}
      <main className="task-grid-container">
        {loading && (
          <div className="state-msg">
            <span className="spinner" /> Loading tasks…
          </div>
        )}
        {!loading && error && (
          <div className="state-msg error">
            <span>⚠️ {error}</span>
            <button className="btn btn-ghost" onClick={load}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && visible.length === 0 && (
          <div className="state-msg">
            <span>No tasks here yet.</span>
            <button className="btn btn-primary" onClick={() => setModal(true)}>
              Create your first task
            </button>
          </div>
        )}
        {!loading && !error && visible.length > 0 && (
          <div className="task-grid">
            {visible.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <CreateModal
          onClose={() => setModal(false)}
          onCreated={(t) => setTasks((prev) => [t, ...prev])}
        />
      )}
    </div>
  );
}
