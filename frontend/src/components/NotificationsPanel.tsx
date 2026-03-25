import type { Notification } from "../api/notifications";
import "../styles/NotificationsPanel.css";

interface Props {
  notifications: Notification[];
  loading: boolean;
  unreadIds: Set<string>;
  onClose: () => void;
  onRefresh: () => void;
}

function fmtTime(dt: string): string {
  const d = new Date(dt);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsPanel({
  notifications,
  loading,
  unreadIds,
  onClose,
  onRefresh,
}: Props) {
  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <>
      <div className="notif-backdrop" onClick={onClose} />
      <aside className="notif-panel">
        <div className="notif-panel-header">
          <div className="notif-panel-title">
            <span className="notif-bell-icon">🔔</span>
            <h2>Notifications</h2>
            {notifications.length > 0 && (
              <span className="notif-total-badge">{notifications.length}</span>
            )}
          </div>
          <div className="notif-header-actions">
            <button
              className="btn btn-ghost notif-refresh-btn"
              onClick={onRefresh}
              title="Refresh notifications"
            >
              ↻
            </button>
            <button className="icon-btn" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        <div className="notif-list">
          {loading && (
            <div className="notif-empty">
              <span className="spinner" />
              <span>Loading…</span>
            </div>
          )}
          {!loading && sorted.length === 0 && (
            <div className="notif-empty">
              <span className="notif-empty-icon">🔔</span>
              <p className="notif-empty-title">No notifications yet</p>
              <p className="notif-empty-sub">
                Task reminders will appear here when due dates are approaching.
              </p>
            </div>
          )}
          {!loading &&
            sorted.map((n) => {
              const isUnread = unreadIds.has(n.id);
              const showTaskId =
                n.taskId &&
                n.taskId !== "extract-from-message" &&
                n.taskId.length > 0;
              return (
                <div
                  key={n.id}
                  className={`notif-item${isUnread ? " notif-item--unread" : ""}`}
                >
                  {isUnread && <span className="notif-unread-dot" />}
                  <div className="notif-item-icon">🔔</div>
                  <div className="notif-item-body">
                    <p className="notif-item-msg">{n.message}</p>
                    <div className="notif-item-meta">
                      {showTaskId && (
                        <span className="notif-task-tag">
                          Task {n.taskId.slice(0, 8)}…
                        </span>
                      )}
                      <span className="notif-time">{fmtTime(n.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </aside>
    </>
  );
}
