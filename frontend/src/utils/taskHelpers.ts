import type { Priority, Status } from "../types/task";
import type { CreateTaskBody } from "../api";

// ─── Priority display metadata ─────────────────────────────────────────────────

export const PRIORITY_META: Record<Priority, { label: string; cls: string }> = {
  LOW: { label: "Low", cls: "badge-low" },
  MEDIUM: { label: "Medium", cls: "badge-medium" },
  HIGH: { label: "High", cls: "badge-high" },
};

// ─── Status display metadata ───────────────────────────────────────────────────

export const STATUS_META: Record<Status, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "status-pending" },
  IN_PROGRESS: { label: "In Progress", cls: "status-in_progress" },
  DONE: { label: "Done", cls: "status-done" },
};

// ─── Empty create form ─────────────────────────────────────────────────────────

export const EMPTY_FORM: CreateTaskBody = {
  title: "",
  description: "",
  priority: "MEDIUM",
  dueDate: "",
};

// ─── Date formatter ────────────────────────────────────────────────────────────

export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
