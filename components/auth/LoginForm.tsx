"use client";

import { useEffect, useState } from "react";
import { Compass, Sparkles } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function captureHashSession() {
      if (typeof window === "undefined") return;
      if (!window.location.hash.includes("access_token")) return;

      const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        setMessage("Login returned incomplete session. Please try again.");
        return;
      }

      setMessage("Finishing login...");
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
      });

      if (!response.ok) {
        setMessage("Could not save login session. Please try again.");
        return;
      }

      window.history.replaceState(null, "", "/login");
      window.location.href = "/";
    }

    void captureHashSession();
  }, []);

  async function signInWithGoogle() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase env vars missing.");
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/login` },
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
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });

    setMessage(error ? error.message : "Check your email for the login link.");
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden overflow-hidden bg-[#232D4B] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E57200]"><Compass size={25} /></div>
            <div className="text-2xl font-black tracking-tight">Compass</div>
          </div>
          <h1 className="mt-16 max-w-xl text-6xl font-black leading-[0.95] tracking-tight text-white">Your MBA recruiting companion.</h1>
          <p className="mt-6 max-w-md text-lg font-medium leading-relaxed text-white/65">Stay organized. Build relationships. Land your dream role.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {["Stay organized", "Build momentum", "Never miss follow-ups"].map((item) => (
            <div key={item} className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
              <Sparkles className="text-[#E57200]" size={18} />
              <div className="mt-3 text-sm font-black">{item}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[32px] border border-stone-200 bg-white p-6 shadow-medium">
          <div className="rounded-[24px] bg-[#232D4B] p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E57200]"><Compass size={20} /></div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">Welcome to</div>
                <div className="text-2xl font-black tracking-tight">Compass</div>
              </div>
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight text-[#172033]">Sign in</h1>
          <p className="mt-2 text-sm font-medium text-stone-600">Each user gets their own events, Google connection, people, applications, and tasks.</p>

          <button className="btn mt-5 w-full" onClick={signInWithGoogle}>Continue with Google</button>

          <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-stone-400">
            <div className="h-px flex-1 bg-stone-200" /> or <div className="h-px flex-1 bg-stone-200" />
          </div>

          <form onSubmit={signInWithMagicLink} className="space-y-3">
            <label>
              <span className="label">Email</span>
              <input className="input" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <button className="btn-secondary w-full" type="submit">Send magic link</button>
          </form>

          {message ? <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-900">{message}</div> : null}
        </div>
      </section>
    </div>
  );
}
