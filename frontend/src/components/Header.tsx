import "../styles/Header.css";

interface Props {
  onNewTask: () => void;
  onLogout: () => void;
}

export default function Header({ onNewTask, onLogout }: Props) {
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
        <button className="btn btn-ghost" onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </header>
  );
}
