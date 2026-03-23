import { setToken } from "./client";

// ─── Login ─────────────────────────────────────────────────────────────────────

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

// ─── Register ─────────────────────────────────────────────────────────────────

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
