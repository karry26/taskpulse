import { authFetch } from "./client";

// ─── Notification model ────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  taskId: string;
  message: string;
  createdAt: string; // ISO datetime string from backend
}

// ─── Notification API calls ────────────────────────────────────────────────────

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await authFetch("/notifications");
  if (!res.ok) throw new Error("Failed to fetch notifications.");
  return res.json();
}
