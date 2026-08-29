import React, { FormEvent, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

async function login(accessCode: string): Promise<void> {
  const response = await fetch("/admin/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ accessCode }),
    credentials: "include",
  });
  if (!response.ok) throw new Error("admin_auth_failed");
}

async function hasSession(): Promise<boolean> {
  const response = await fetch("/admin/auth/session", { credentials: "include", cache: "no-store" });
  return response.ok;
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void hasSession()
      .then(setAuthenticated)
      .catch(() => setAuthenticated(false))
      .finally(() => setBusy(false));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(accessCode);
      setAccessCode("");
      setAuthenticated(true);
    } catch {
      setError("Access denied. Check the Admin Access Code.");
    } finally {
      setBusy(false);
    }
  }

  if (busy && !authenticated) return <main className="shell"><section className="panel">Checking session…</section></main>;

  if (!authenticated) {
    return (
      <main className="shell auth-shell">
        <section className="panel auth-panel" aria-labelledby="admin-title">
          <div className="eyebrow">PRIME ADMIN</div>
          <h1 id="admin-title">Admin Access</h1>
          <p className="muted">Enter the Admin Access Code to continue.</p>
          <form className="stack" onSubmit={submit}>
            <label className="field">
              <span>Admin Access Code</span>
              <input autoComplete="one-time-code" inputMode="text" type="password" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} required />
            </label>
            <button className="primary" type="submit" disabled={busy}>{busy ? "Verifying…" : "Enter Admin"}</button>
          </form>
          {error ? <p className="error" role="alert">{error}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div><div className="eyebrow">PRIME ADMIN</div><h1>Control Center</h1></div>
        <span className="status">Authenticated</span>
      </header>
      <section className="stack cards" aria-label="Admin modules">
        <article className="panel compact-card"><strong>Orders</strong><span className="muted">Review and process customer orders.</span></article>
        <article className="panel compact-card"><strong>Catalog</strong><span className="muted">Products, categories, and media.</span></article>
        <article className="panel compact-card"><strong>Inventory</strong><span className="muted">Stock levels and movement history.</span></article>
        <article className="panel compact-card"><strong>Payments</strong><span className="muted">Payment proofs and review decisions.</span></article>
        <article className="panel compact-card"><strong>POS</strong><span className="muted">Walk-in order operations.</span></article>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
