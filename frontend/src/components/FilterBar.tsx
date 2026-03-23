import type { Status, FilterStatus } from "../types/task";
import { STATUS_META } from "../utils/taskHelpers";
import "../styles/Header.css";

interface Props {
  filter: FilterStatus;
  counts: Record<string, number>;
  onFilter: (f: FilterStatus) => void;
  onRefresh: () => void;
}

export default function FilterBar({
  filter,
  counts,
  onFilter,
  onRefresh,
}: Props) {
  return (
    <div className="filter-bar">
      {(["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"] as FilterStatus[]).map(
        (s) => (
          <button
            key={s}
            className={`filter-btn${filter === s ? " active" : ""}`}
            onClick={() => onFilter(s)}
          >
            {s === "ALL" ? "All" : STATUS_META[s as Status].label}
            <span className="filter-count">{counts[s] ?? 0}</span>
          </button>
        ),
      )}
      <button
        className="btn btn-ghost refresh-btn"
        onClick={onRefresh}
        title="Refresh"
      >
        ↻
      </button>
    </div>
  );
}
