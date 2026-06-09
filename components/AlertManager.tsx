"use client";
import { useState } from "react";
import { Card } from "@/components/ui";

export function AlertManager({
  token,
  email,
  frequency,
  startUnsub,
}: {
  token: string;
  email: string;
  frequency: string;
  startUnsub: boolean;
}) {
  const [freq, setFreq] = useState(frequency === "weekly" ? "weekly" : "daily");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/alerts/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, frequency: freq }),
      });
      const d = await r.json();
      setMsg(d.ok ? { ok: true, text: "Je voorkeuren zijn opgeslagen." } : { ok: false, text: "Opslaan mislukt." });
    } catch {
      setMsg({ ok: false, text: "Er ging iets mis." });
    }
    setBusy(false);
  }

  async function unsubscribe() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch(`/api/alerts/unsubscribe?token=${encodeURIComponent(token)}`, { method: "POST" });
      const d = await r.json();
      if (d.ok) setUnsubscribed(true);
      else setMsg({ ok: false, text: "Uitschrijven mislukt." });
    } catch {
      setMsg({ ok: false, text: "Er ging iets mis." });
    }
    setBusy(false);
  }

  if (unsubscribed) {
    return (
      <Card className="mt-4 p-6 text-center">
        <div className="text-2xl">👋</div>
        <h2 className="mt-2 font-bold text-slate-900">Je bent uitgeschreven</h2>
        <p className="mt-1 text-sm text-slate-600">
          Je ontvangt geen vacature-alerts meer. Je kunt je altijd opnieuw aanmelden via de website.
        </p>
      </Card>
    );
  }

  const input =
    "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

  return (
    <Card className="mt-4 space-y-5 p-6">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">E-mailadres</label>
        <input value={email} disabled className={`${input} bg-slate-50 text-slate-500`} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Frequentie</label>
        <select value={freq} onChange={(e) => setFreq(e.target.value)} className={input}>
          <option value="daily">Dagelijks</option>
          <option value="weekly">Wekelijks</option>
        </select>
      </div>
      {msg && <p className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
      <button
        onClick={save}
        disabled={busy}
        className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        Voorkeuren opslaan
      </button>

      <div className={`mt-2 rounded-xl border p-4 ${startUnsub ? "border-red-200 bg-red-50" : "border-slate-200"}`}>
        <p className="text-sm font-medium text-slate-700">Geen alerts meer ontvangen?</p>
        <button
          onClick={unsubscribe}
          disabled={busy}
          className="mt-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
        >
          Uitschrijven
        </button>
      </div>
    </Card>
  );
}
