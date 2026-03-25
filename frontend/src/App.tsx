import { useState, useEffect, useCallback, useRef } from "react";
import "./index.css";
import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import TaskCard from "./components/TaskCard";
import CreateModal from "./components/CreateModal";
import EditModal from "./components/EditModal";
import NotificationsPanel from "./components/NotificationsPanel";
import AuthPage from "./pages/AuthPage";
import { getToken, clearToken, AuthError } from "./api/client";
import { fetchTasks, patchTaskStatus, type Task } from "./api/tasks";
import { fetchNotifications, type Notification } from "./api/notifications";
import type { FilterStatus, Status } from "./types/task";

export default function App() {
  const [authed, setAuthed] = useState<boolean>(() => !!getToken());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);

  // ── Notifications state ────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  // IDs of notifications the user hasn't seen yet
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());
  const seenIdsRef = useRef<Set<string>>(new Set());

  function handleLogout() {
    clearToken();
    setAuthed(false);
    setTasks([]);
    setNotifications([]);
    setUnreadIds(new Set());
    seenIdsRef.current = new Set();
  }

  function handleTaskUpdated(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleTaskDeleted(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleDrop(taskId: string, newStatus: Status) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;
    // Optimistic update so the card moves instantly
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? ({ ...t, status: newStatus } as Task) : t,
      ),
    );
    try {
      const updated = await patchTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? ({ ...t, status: task.status } as Task) : t,
        ),
      );
      alert("Could not move task.");
    }
  }

  function dropProps(col: Status) {
    return {
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverCol(col);
      },
      onDragLeave: () => setDragOverCol(null),
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        setDragOverCol(null);
        const id = e.dataTransfer.getData("taskId");
        if (id) handleDrop(id, col);
      },
    };
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

  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
      // Mark any notification IDs we haven't seen before as unread
      setUnreadIds((prev) => {
        const next = new Set(prev);
        for (const n of data) {
          if (!seenIdsRef.current.has(n.id)) {
            next.add(n.id);
          }
        }
        return next;
      });
    } catch {
      // Silently ignore notification fetch errors (non-critical)
    } finally {
      setNotifLoading(false);
    }
  }, []);

  function handleOpenNotifications() {
    setNotifPanelOpen(true);
    // Mark all current notifications as seen
    setUnreadIds(new Set());
    seenIdsRef.current = new Set(notifications.map((n) => n.id));
  }

  function handleCloseNotifications() {
    setNotifPanelOpen(false);
  }

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  // Poll notifications every 60 s (matches the backend scheduler interval)
  useEffect(() => {
    if (!authed) return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 60_000);
    return () => clearInterval(interval);
  }, [authed, loadNotifications]);

  if (!authed) {
    return (
      <AuthPage
        onAuth={() => {
          setAuthed(true);
        }}
      />
    );
  }

  const pendingTasks = tasks.filter((t) => t.status === "PENDING");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
  const visible =
    filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);

  const counts: Record<string, number> = { ALL: tasks.length };
  for (const t of tasks) counts[t.status] = (counts[t.status] ?? 0) + 1;

  return (
    <div className="app">
      <Header
        onNewTask={() => setModal(true)}
        onLogout={handleLogout}
        onNotifications={handleOpenNotifications}
        unreadCount={unreadIds.size}
      />

      <FilterBar
        filter={filter}
        counts={counts}
        onFilter={setFilter}
        onRefresh={load}
      />

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
        {!loading && !error && filter === "ALL" && (
          <div className="task-sections">
            {/* ── Pending ── */}
            <section
              className={`task-section${dragOverCol === "PENDING" ? " drag-over" : ""}`}
              {...dropProps("PENDING")}
            >
              <div className="section-header">
                <h2 className="section-title">Pending</h2>
                <span className="section-count">{pendingTasks.length}</span>
              </div>
              {pendingTasks.length === 0 ? (
                <div className="section-empty">Drop tasks here</div>
              ) : (
                <div className="task-list">
                  {pendingTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onEdit={setEditingTask}
                      onDelete={handleTaskDeleted}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── In Progress ── */}
            <section
              className={`task-section${dragOverCol === "IN_PROGRESS" ? " drag-over" : ""}`}
              {...dropProps("IN_PROGRESS")}
            >
              <div className="section-header">
                <h2 className="section-title">In Progress</h2>
                <span className="section-count">{inProgressTasks.length}</span>
              </div>
              {inProgressTasks.length === 0 ? (
                <div className="section-empty">Drop tasks here</div>
              ) : (
                <div className="task-list">
                  {inProgressTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onEdit={setEditingTask}
                      onDelete={handleTaskDeleted}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── Completed ── */}
            <section
              className={`task-section${dragOverCol === "COMPLETED" ? " drag-over" : ""}`}
              {...dropProps("COMPLETED")}
            >
              <div className="section-header">
                <h2 className="section-title">Completed</h2>
                <span className="section-count">{completedTasks.length}</span>
              </div>
              {completedTasks.length === 0 ? (
                <div className="section-empty">Drop tasks here</div>
              ) : (
                <div className="task-list">
                  {completedTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onEdit={setEditingTask}
                      onDelete={handleTaskDeleted}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
        {!loading && !error && filter !== "ALL" && visible.length === 0 && (
          <div className="state-msg">
            <span>No tasks here yet.</span>
            <button className="btn btn-primary" onClick={() => setModal(true)}>
              Create your first task
            </button>
          </div>
        )}
        {!loading && !error && filter !== "ALL" && visible.length > 0 && (
          <div className="task-grid">
            {visible.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onEdit={setEditingTask}
                onDelete={handleTaskDeleted}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showModal && (
        <CreateModal
          onClose={() => setModal(false)}
          onCreated={(t) => setTasks((prev) => [t, ...prev])}
        />
      )}

      {/* Edit Modal */}
      {editingTask && (
        <EditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdated={handleTaskUpdated}
        />
      )}

      {/* Notifications panel */}
      {notifPanelOpen && (
        <NotificationsPanel
          notifications={notifications}
          loading={notifLoading}
          unreadIds={unreadIds}
          onClose={handleCloseNotifications}
          onRefresh={loadNotifications}
        />
      )}
    </div>
  );
}
