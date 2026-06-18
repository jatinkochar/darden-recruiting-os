"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function signInWithGoogle() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase env vars missing.");
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  }

  async function signInWithMagicLink(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase env vars missing.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    setMessage(error ? error.message : "Check your email for the login link.");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center justify-center p-6">
      <div className="card w-full p-6">
        <div className="rounded-2xl bg-stone-900 p-4 text-white">
          <div className="text-xs font-black uppercase tracking-widest text-stone-300">Darden</div>
          <div className="mt-1 text-2xl font-black tracking-tight">Recruiting OS</div>
        </div>

        <h1 className="mt-6 text-3xl font-black tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-stone-600">
          Each user gets their own events, Google connection, CRM, applications, and tasks.
        </p>

        <button className="btn mt-5 w-full" onClick={signInWithGoogle}>
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-stone-400">
          <div className="h-px flex-1 bg-stone-200" />
          or
          <div className="h-px flex-1 bg-stone-200" />
        </div>

        <form onSubmit={signInWithMagicLink} className="space-y-3">
          <label>
            <span className="label">Email</span>
            <input
              className="input"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button className="btn-secondary w-full" type="submit">
            Send magic link
          </button>
        </form>

        {message ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-900">
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}
