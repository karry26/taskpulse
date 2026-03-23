import { authFetch } from "./client";
import type { Status, Priority } from "../types/task";

// ─── Task model ────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate: string | null;
  createdAt: string;
}

export interface CreateTaskBody {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
}

export interface UpdateTaskBody {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  dueDate?: string | null;
}

// ─── Task API calls ────────────────────────────────────────────────────────────

export async function fetchTasks(): Promise<Task[]> {
  const res = await authFetch("/tasks");
  if (!res.ok) throw new Error("Failed to fetch tasks.");
  return res.json();
}

export async function createTask(body: CreateTaskBody): Promise<Task> {
  const res = await authFetch("/tasks", {
    method: "POST",
    body: JSON.stringify({
      ...body,
      dueDate: body.dueDate ? body.dueDate + ":00" : null,
    }),
  });
  if (!res.ok) throw new Error("Failed to create task.");
  return res.json();
}

export async function updateTask(
  id: string,
  body: UpdateTaskBody,
): Promise<Task> {
  const res = await authFetch(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...body,
      dueDate: body.dueDate ? body.dueDate + ":00" : (body.dueDate ?? null),
    }),
  });
  if (!res.ok) throw new Error("Failed to update task.");
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await authFetch(`/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete task.");
}

// ─── PATCH /tasks/{id}/status — used by drag-and-drop ─────────────────────────
export async function patchTaskStatus(
  id: string,
  status: Status,
): Promise<Task> {
  const res = await authFetch(`/tasks/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update task status.");
  return res.json();
}
