"use client";

import { useState } from "react";
import { AlertTriangle, PlugZap, Trash2 } from "lucide-react";

export function AccountPrivacyControls() {
  const [busy, setBusy] = useState<"disconnect" | "delete" | null>(null);
  const [message, setMessage] = useState("");

  async function disconnectGoogle() {
    const ok = confirm(
      "Disconnect Google? This removes your stored Google tokens. Your already imported events will stay."
    );
    if (!ok) return;

    setBusy("disconnect");
    setMessage("");

    const res = await fetch("/api/account/disconnect-google", {
      method: "POST"
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setMessage(json.error || "Could not disconnect Google.");
      setBusy(null);
      return;
    }

    setMessage("Google disconnected. Stored Google tokens were deleted.");
    setBusy(null);
  }

  async function deleteAccount() {
    const first = confirm(
      "This will permanently delete your Recruiting OS account data: events, contacts, applications, tasks, Google tokens, and your auth user. This cannot be undone."
    );
    if (!first) return;

    const typed = prompt('Type DELETE to confirm permanent deletion.');
    if (typed !== "DELETE") {
      setMessage("Deletion cancelled.");
      return;
    }

    setBusy("delete");
    setMessage("");

    const res = await fetch("/api/account/delete", {
      method: "POST"
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setMessage(json.error || "Could not delete account.");
      setBusy(null);
      return;
    }

    window.location.href = "/login?deleted=1";
  }

  return (
    <div className="card p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-red-100 p-3 text-red-700">
          <AlertTriangle size={22} />
        </div>

        <div>
          <h2 className="text-xl font-black tracking-tight">Privacy & Account</h2>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Control your Google connection and delete your stored Recruiting OS data.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-white/70 p-4">
          <div className="flex items-center gap-2 font-black">
            <PlugZap size={18} />
            Disconnect Google
          </div>
          <p className="mt-2 text-sm text-stone-600">
            Deletes your stored Google OAuth tokens. Imported events remain unless you delete them separately.
          </p>
          <button
            className="btn-secondary mt-4"
            disabled={busy !== null}
            onClick={disconnectGoogle}
          >
            {busy === "disconnect" ? "Disconnecting..." : "Disconnect Google"}
          </button>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 font-black text-red-800">
            <Trash2 size={18} />
            Delete Account & Data
          </div>
          <p className="mt-2 text-sm text-red-800">
            Permanently deletes your events, contacts, applications, tasks, integrations, Google tokens, and account.
          </p>
          <button
            className="mt-4 rounded-full bg-red-700 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
            disabled={busy !== null}
            onClick={deleteAccount}
          >
            {busy === "delete" ? "Deleting..." : "Delete My Account"}
          </button>
        </div>
      </div>

      {message ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-900">
          {message}
        </div>
      ) : null}
    </div>
  );
}
