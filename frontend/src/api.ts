// ─── Token storage ────────────────────────────────────────────────────────────

const TOKEN_KEY = "tp_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Authenticated fetch ───────────────────────────────────────────────────────

export class AuthError extends Error {}

async function authFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401) {
    clearToken();
    throw new AuthError("Session expired. Please log in again.");
  }

  return res;
}

// ─── Auth endpoints ────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (res.status === 401 || res.status === 403 || !res.ok) {
    throw new Error("Invalid email or password.");
  }
  const token = await res.text();
  setToken(token);
  return token;
}

export async function register(email: string, password: string): Promise<void> {
  const res = await fetch("/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Registration failed.");
  }
}

// ─── Task endpoints ────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  dueDate: string | null;
  createdAt: string;
}

export interface CreateTaskBody {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string;
}

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
