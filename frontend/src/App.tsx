import { useState, useEffect, useCallback } from "react";
import "./index.css";
import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import TaskCard from "./components/TaskCard";
import CreateModal from "./components/CreateModal";
import EditModal from "./components/EditModal";
import AuthPage from "./pages/AuthPage";
import { getToken, clearToken, fetchTasks, AuthError, type Task } from "./api";
import type { FilterStatus } from "./types/task";

export default function App() {
  const [authed, setAuthed] = useState<boolean>(() => !!getToken());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  function handleLogout() {
    clearToken();
    setAuthed(false);
    setTasks([]);
  }

  function handleTaskUpdated(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleTaskDeleted(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
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

  const pendingTasks = tasks.filter(
    (t) => t.status === "PENDING" || t.status === "IN_PROGRESS",
  );
  const completedTasks = tasks.filter((t) => t.status === "DONE");
  const visible =
    filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);

  const counts: Record<string, number> = { ALL: tasks.length };
  for (const t of tasks) counts[t.status] = (counts[t.status] ?? 0) + 1;

  return (
    <div className="app">
      <Header onNewTask={() => setModal(true)} onLogout={handleLogout} />

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
            {/* Pending / In-Progress column */}
            <section className="task-section">
              <div className="section-header">
                <h2 className="section-title">Active Tasks</h2>
                <span className="section-count">{pendingTasks.length}</span>
              </div>
              {pendingTasks.length === 0 ? (
                <div className="section-empty">No active tasks 🎉</div>
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

            {/* Completed column */}
            <section className="task-section">
              <div className="section-header">
                <h2 className="section-title">Completed</h2>
                <span className="section-count">{completedTasks.length}</span>
              </div>
              {completedTasks.length === 0 ? (
                <div className="section-empty">No completed tasks yet.</div>
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
    </div>
  );
}
