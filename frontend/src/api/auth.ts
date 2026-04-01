import { setToken } from "./client";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

// ─── Login ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
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

// ─── Register ─────────────────────────────────────────────────────────────────

export async function register(email: string, password: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Registration failed.");
  }
}
