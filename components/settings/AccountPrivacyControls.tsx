"use client";

import { useState } from "react";
import { AlertTriangle, PlugZap, Trash2 } from "lucide-react";

export function AccountPrivacyControls() {
  const [busy, setBusy] = useState<"disconnect" | "delete" | null>(null);
  const [message, setMessage] = useState("");

  async function disconnectGoogle() {
    const ok = confirm("Disconnect Google? This removes your stored Google tokens. Your already imported events will stay.");
    if (!ok) return;
    setBusy("disconnect");
    setMessage("");
    const res = await fetch("/api/account/disconnect-google", { method: "POST" });
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
    const first = confirm("This will permanently delete your Compass account data: events, contacts, applications, tasks, Google tokens, and your auth user. This cannot be undone.");
    if (!first) return;
    const typed = prompt('Type DELETE to confirm permanent deletion.');
    if (typed !== "DELETE") {
      setMessage("Deletion cancelled.");
      return;
    }
    setBusy("delete");
    setMessage("");
    const res = await fetch("/api/account/delete", { method: "POST" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(json.error || "Could not delete account.");
      setBusy(null);
      return;
    }
    window.location.href = "/login?deleted=1";
  }

  return (
    <div className="rounded-[30px] border border-stone-200 bg-white p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-[#FFF3E7] p-3 text-[#B85C00]"><AlertTriangle size={22} /></div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#172033]">Privacy & Account</h2>
          <p className="mt-2 max-w-2xl text-sm font-medium text-stone-600">Control your Google connection and delete your stored Compass data.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
          <div className="flex items-center gap-2 font-black text-[#172033]"><PlugZap size={18} /> Disconnect Google</div>
          <p className="mt-2 text-sm font-medium text-stone-600">Deletes your stored Google OAuth tokens. Imported events remain unless you delete them separately.</p>
          <button className="btn-secondary mt-4" disabled={busy !== null} onClick={disconnectGoogle}>{busy === "disconnect" ? "Disconnecting..." : "Disconnect Google"}</button>
        </div>

        <div className="rounded-3xl border border-red-100 bg-red-50 p-5">
          <div className="flex items-center gap-2 font-black text-red-800"><Trash2 size={18} /> Delete Account & Data</div>
          <p className="mt-2 text-sm font-medium text-red-800">Permanently deletes your events, contacts, applications, tasks, integrations, Google tokens, and account.</p>
          <button className="mt-4 rounded-full bg-red-700 px-4 py-3 text-sm font-black text-white disabled:opacity-60" disabled={busy !== null} onClick={deleteAccount}>{busy === "delete" ? "Deleting..." : "Delete My Account"}</button>
        </div>
      </div>

      {message ? <div className="mt-4 rounded-2xl border border-[#FFE0BD] bg-[#FFF3E7] p-3 text-sm font-bold text-[#B85C00]">{message}</div> : null}
    </div>
  );
}
