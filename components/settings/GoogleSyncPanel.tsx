"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, RefreshCw, Mail, CalendarDays, Database } from "lucide-react";

type GoogleStatus = {
  connected: boolean;
  provider?: string;
  updated_at?: string | null;
  expires_at?: string | null;
  last_sync_at?: string | null;
  last_sync_status?: string | null;
  last_sync_error?: string | null;
  last_sync_gmail_messages?: number | null;
  last_sync_gmail_events?: number | null;
  last_sync_calendar_events?: number | null;
  last_sync_imported?: number | null;
};

function formatDateTime(value?: string | null) {
  if (!value) return "Never";
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch {
    return value;
  }
}

export function GoogleSyncPanel() {
  const [status, setStatus] = useState<GoogleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");

  async function loadStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/google/status", { cache: "no-store" });
      const json = await res.json();
      setStatus(json);
    } catch {
      setStatus({ connected: false, last_sync_error: "Could not load Google status." });
    } finally {
      setLoading(false);
    }
  }

  async function syncNow() {
    setSyncing(true);
    setMessage("");

    try {
      const res = await fetch("/api/sync/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const json = await res.json();

      if (!res.ok) {
        setMessage(json.error || "Sync failed.");
      } else {
        setMessage(`Sync complete. Imported ${json.imported ?? 0} events.`);
      }

      await loadStatus();
    } catch {
      setMessage("Sync failed due to a network or server error.");
      await loadStatus();
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  const connected = Boolean(status?.connected);

  return (
    <div className="card p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h2 className="text-xl font-black">Google Gmail + Calendar</h2>
          <p className="mt-2 max-w-2xl text-stone-600">
            Connect Google once. After that, sync pulls recruiting emails from Gmail and relevant events from Google Calendar.
          </p>
        </div>

        <div className={`pill ${connected ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
          {connected ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {loading ? "Checking..." : connected ? "Connected" : "Not connected"}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <InfoCard icon={<RefreshCw size={16} />} label="Last Sync" value={formatDateTime(status?.last_sync_at)} />
        <InfoCard icon={<Database size={16} />} label="Last Status" value={status?.last_sync_status || "—"} />
        <InfoCard icon={<Mail size={16} />} label="Gmail Events" value={String(status?.last_sync_gmail_events ?? "—")} />
        <InfoCard icon={<CalendarDays size={16} />} label="Calendar Events" value={String(status?.last_sync_calendar_events ?? "—")} />
      </div>

      {status?.last_sync_error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="font-black">Last sync error</div>
          <div className="mt-1">{status.last_sync_error}</div>
        </div>
      ) : null}

      {message ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
          {message}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <a className="btn" href="/api/auth/google/start">
          {connected ? "Reconnect Google" : "Connect Google"}
        </a>

        <button
          className="btn-secondary"
          onClick={syncNow}
          disabled={!connected || syncing}
        >
          {syncing ? "Syncing..." : "Sync Google Now"}
        </button>

        <button className="btn-secondary" onClick={loadStatus}>
          Refresh Status
        </button>
      </div>

      <div className="mt-5 rounded-2xl border border-stone-200 bg-white/60 p-4 text-sm text-stone-600">
        Connected: {connected ? "Yes" : "No"} · Token updated: {formatDateTime(status?.updated_at)} · Imported last time: {status?.last_sync_imported ?? "—"}
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white/70 p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-stone-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm font-black text-stone-900">{value}</div>
    </div>
  );
}
