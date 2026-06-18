"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Briefcase, CalendarDays, CheckCircle2, Clock, Flame, Mail, Plus, Sparkles, Users } from "lucide-react";
import contacts from "@/data/contacts.json";
import tasks from "@/data/tasks.json";
import { EventCard } from "@/components/events/EventCard";
import { StatCard } from "@/components/ui/StatCard";
import { computedStatus, eventDate } from "@/lib/utils";
import type { RecruitingEvent } from "@/types";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatShortDate(value?: string) {
  if (!value) return "Soon";
  return new Date(`${value}T00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function DashboardClient() {
  const [events, setEvents] = useState<RecruitingEvent[]>([]);
  const [source, setSource] = useState<"loading" | "supabase" | "local">("loading");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/events", { cache: "no-store" });
      if (!res.ok) {
        setSource("local");
        return;
      }
      const json = await res.json();
      setEvents(json.events || []);
      setSource("supabase");
    }
    void load();
  }, []);

  const upcoming = useMemo(() => {
    return events
      .filter((event) => {
        const d = eventDate(event);
        return d && d >= new Date(new Date().toDateString());
      })
      .sort((a, b) => Number(eventDate(a)) - Number(eventDate(b)));
  }, [events]);

  const todaysEvents = events.filter((e) => computedStatus(e) === "Happening Today");
  const openTasks = tasks.filter((t) => t.status !== "Done");
  const mbbCount = events.filter((e) => ["McKinsey", "Bain", "BCG"].includes(e.company)).length;

  const focusItems = [
    todaysEvents[0] ? { label: todaysEvents[0].title, meta: `${todaysEvents[0].company} · today`, icon: CalendarDays } : null,
    openTasks[0] ? { label: openTasks[0].title, meta: `${openTasks[0].company || "Task"} · due soon`, icon: CheckCircle2 } : null,
    upcoming[0] ? { label: upcoming[0].title, meta: `${upcoming[0].company} · ${formatShortDate(upcoming[0].date)}`, icon: Clock } : null,
  ].filter(Boolean) as { label: string; meta: string; icon: typeof CalendarDays }[];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-medium">
        <div className="grid gap-0 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="p-7 md:p-9">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FFE0BD] bg-[#FFF3E7] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#B85C00]">
              <Sparkles size={14} /> Compass · {source}
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.95] tracking-tight text-[#172033] md:text-6xl">
              {greeting()}, Jatin 👋
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-stone-600 md:text-lg">
              Here’s your recruiting snapshot. Keep it calm, stay consistent, and let’s make today count.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a href="/events" className="btn">View today <ArrowRight size={16} /></a>
              <a href="/settings" className="btn-secondary">Sync Google</a>
              <a href="/applications" className="btn-ghost">Applications</a>
            </div>
          </div>

          <div className="border-t border-stone-200 bg-[#232D4B] p-7 text-white lg:border-l lg:border-t-0">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Today’s focus</div>
            <div className="mt-5 space-y-3">
              {focusItems.length ? focusItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl bg-white/[0.08] p-4">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E57200]"><Icon size={18} /></div>
                      <div className="min-w-0">
                        <div className="line-clamp-2 text-sm font-black text-white">{item.label}</div>
                        <div className="mt-1 text-xs font-semibold text-white/55">{item.meta}</div>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="rounded-2xl bg-white/[0.08] p-4 text-sm font-bold text-white/70">Looks peaceful today. Enjoy it while it lasts ☕</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Applications" value={23} helper="in progress" icon={<Briefcase size={18} />} tone="navy" />
        <StatCard label="Events today" value={todaysEvents.length} helper={`${upcoming.length} upcoming`} icon={<CalendarDays size={18} />} tone="neutral" />
        <StatCard label="Tasks" value={openTasks.length} helper="open right now" icon={<CheckCircle2 size={18} />} tone="orange" />
        <StatCard label="People" value={contacts.length} helper={`${mbbCount} MBB touchpoints`} icon={<Users size={18} />} tone="blue" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-[#172033]">Upcoming</h2>
              <p className="mt-1 text-sm font-medium text-stone-500">The next few things on your recruiting radar.</p>
            </div>
            <a className="text-sm font-black text-[#E57200]" href="/calendar">View calendar →</a>
          </div>

          <div className="mt-5 space-y-3">
            {upcoming.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-stone-50/70 p-3">
                <div className="w-14 shrink-0 text-center">
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#E57200]">{formatShortDate(event.date).split(" ")[0]}</div>
                  <div className="text-xl font-black text-[#172033]">{formatShortDate(event.date).split(" ")[1] || "—"}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black text-[#172033]">{event.title}</div>
                  <div className="mt-1 text-xs font-bold text-stone-500">{event.company} · {event.startTime || "Time TBD"} {event.timezone}</div>
                </div>
                {event.meetingLink ? <a className="btn-secondary px-3 py-2 text-xs" href={event.meetingLink} target="_blank">Join</a> : null}
              </div>
            ))}

            {upcoming.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-200 p-8 text-center">
                <div className="text-lg font-black text-[#172033]">Your calendar looks surprisingly peaceful.</div>
                <p className="mt-2 text-sm text-stone-500">Sync Google or add your first event when you’re ready.</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-[#172033]">Momentum</h2>
              <p className="mt-1 text-sm font-medium text-stone-500">Small wins, stacked consistently.</p>
            </div>
            <Flame className="text-[#E57200]" size={22} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            <Momentum label="Events captured" value={`+${events.length}`} />
            <Momentum label="People tracked" value={`+${contacts.length}`} />
            <Momentum label="Tasks open" value={openTasks.length} />
          </div>

          <div className="mt-6 rounded-3xl bg-[#FFF3E7] p-5">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 text-[#E57200]" size={19} />
              <div>
                <div className="font-black text-[#172033]">You’re building your recruiting system.</div>
                <p className="mt-1 text-sm font-medium text-stone-600">Next step: keep notes after every coffee chat. Future you will thank you.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight text-[#172033]">Next Events</h2>
          <a className="font-black text-[#E57200]" href="/events">View all</a>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {upcoming.slice(0, 6).map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      </section>
    </div>
  );
}

function Momentum({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-stone-500">{label}</div>
      <div className="mt-2 text-3xl font-black tracking-tight text-[#172033]">{value}</div>
    </div>
  );
}
