import "../styles/Header.css";

interface Props {
  onNewTask: () => void;
  onLogout: () => void;
  onNotifications: () => void;
  unreadCount: number;
}

export default function Header({ onNewTask, onLogout, onNotifications, unreadCount }: Props) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <span className="brand-icon">⚡</span>
        <span className="brand-name">TaskPulse</span>
      </div>
      <div className="header-actions">
        <button className="btn btn-primary" onClick={onNewTask}>
          + New Task
        </button>
        <button
          className="btn btn-ghost notif-bell-btn"
          onClick={onNotifications}
          title="Notifications"
          aria-label="Open notifications"
        >
          🔔
          {unreadCount > 0 && (
            <span className="notif-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
          )}
        </button>
        <button className="btn btn-ghost" onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </header>
  );
}
