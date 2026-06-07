"use client";
import { useState } from "react";

export function AdminLogin() {
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const d = await r.json();
      if (d.ok) location.reload();
      else {
        setErr(d.error || "Inloggen mislukt");
        setLoading(false);
      }
    } catch {
      setErr("Er ging iets mis");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center p-6">
      <h1 className="text-xl font-bold text-slate-900">Maakjobs admin</h1>
      <p className="mt-1 text-sm text-slate-500">Log in om premium-plaatsingen te beheren.</p>
      <form onSubmit={submit} className="mt-5 space-y-3">
        <input
          type="password"
          autoFocus
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Admin-wachtwoord"
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Bezig…" : "Inloggen"}
        </button>
      </form>
    </main>
  );
}
