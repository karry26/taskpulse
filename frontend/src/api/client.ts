// ─── Token storage ─────────────────────────────────────────────────────────────

const TOKEN_KEY = "tp_token";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Auth error ────────────────────────────────────────────────────────────────

export class AuthError extends Error {}

// ─── Authenticated fetch ───────────────────────────────────────────────────────
// All requests that require a JWT token go through this function.

export async function authFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${input}`, { ...init, headers });

  if (res.status === 401) {
    clearToken();
    throw new AuthError("Session expired. Please log in again.");
  }

  return res;
}
