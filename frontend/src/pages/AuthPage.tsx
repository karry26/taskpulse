import { useState } from "react";
import { login, register } from "../api";
import "../styles/AuthPage.css";

type Tab = "login" | "register";

interface Props {
  onAuth: () => void;
}

export default function AuthPage({ onAuth }: Props) {
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function switchTab(t: Tab) {
    setTab(t);
    setError(null);
    setSuccess(null);
    setPassword("");
    setConfirm("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password) {
      return setError("Email and password are required.");
    }

    if (tab === "register") {
      if (password !== confirm) {
        return setError("Passwords do not match.");
      }
      if (password.length < 6) {
        return setError("Password must be at least 6 characters.");
      }
    }

    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
        onAuth();
      } else {
        await register(email, password);
        setSuccess("Account created! Signing you in…");
        await login(email, password);
        onAuth();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-backdrop">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">TaskPulse</span>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === "login" ? " active" : ""}`}
            onClick={() => switchTab("login")}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`auth-tab${tab === "register" ? " active" : ""}`}
            onClick={() => switchTab("register")}
            type="button"
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete={
                tab === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {tab === "register" && (
            <label>
              Confirm Password
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </label>
          )}

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading
              ? tab === "login"
                ? "Signing in…"
                : "Creating account…"
              : tab === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          {tab === "login" ? (
            <>
              No account?{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => switchTab("register")}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => switchTab("login")}
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
