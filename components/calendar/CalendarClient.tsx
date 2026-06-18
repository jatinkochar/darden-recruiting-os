"use client";

import { useMemo, useState } from "react";
import { CalendarDays, List, Sparkles } from "lucide-react";
import type { RecruitingEvent } from "@/types";
import { computedStatus, eventDate, formatTime, statusClass } from "@/lib/utils";
import { Pill } from "@/components/ui/Pill";

function prettyDate(date: string) {
  if (date === "Date TBD") return date;
  return new Date(`${date}T00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function CalendarClient({ events }: { events: RecruitingEvent[] }) {
  const [view, setView] = useState<"agenda" | "month">("agenda");

  const sorted = useMemo(() => [...events].sort((a, b) => Number(eventDate(a) || 9999999999999) - Number(eventDate(b) || 9999999999999)), [events]);

  const byDate = useMemo(() => {
    return sorted.reduce<Record<string, RecruitingEvent[]>>((acc, event) => {
      const key = event.date || "Date TBD";
      acc[key] ||= [];
      acc[key].push(event);
      return acc;
    }, {});
  }, [sorted]);

  const monthDays = useMemo(() => {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 35 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, []);

  return (
    <div className="space-y-5">
      <div className="rounded-[32px] border border-stone-200 bg-white p-7 shadow-medium">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FFE0BD] bg-[#FFF3E7] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#B85C00]">
              <Sparkles size={14} /> Timeline
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-[#172033]">Calendar</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-stone-600">A calmer view of everything coming up across recruiting, coffee chats, and school events.</p>
          </div>
          <div className="flex rounded-2xl border border-stone-200 bg-stone-50 p-1">
            <button className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black ${view === "agenda" ? "bg-[#232D4B] text-white" : "text-stone-500"}`} onClick={() => setView("agenda")}><List size={16} /> Agenda</button>
            <button className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black ${view === "month" ? "bg-[#232D4B] text-white" : "text-stone-500"}`} onClick={() => setView("month")}><CalendarDays size={16} /> Month</button>
          </div>
        </div>
      </div>

      {view === "agenda" ? (
        <div className="space-y-4">
          {Object.entries(byDate).map(([date, list]) => (
            <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-soft" key={date}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-black tracking-tight text-[#172033]">{prettyDate(date)}</h2>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-500">{list.length} events</span>
              </div>
              <div className="mt-4 divide-y divide-stone-100">
                {list.map((event) => (
                  <div className="flex flex-col justify-between gap-3 py-4 md:flex-row md:items-center" key={event.id}>
                    <div className="min-w-0">
                      <div className="font-black text-[#172033]">{event.title}</div>
                      <div className="mt-1 text-sm font-bold text-stone-500">{event.company} · {formatTime(event)}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Pill className={statusClass(computedStatus(event))}>{computedStatus(event)}</Pill>
                      {event.meetingLink ? <a href={event.meetingLink} className="pill bg-[#232D4B] text-white" target="_blank">Join</a> : null}
                      {event.registrationLink ? <a href={event.registrationLink} className="pill bg-[#FFF3E7] text-[#B85C00]" target="_blank">Register</a> : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="grid grid-cols-7 gap-2">
          {monthDays.map((day) => {
            const key = day.toISOString().slice(0, 10);
            const todaysEvents = events.filter((e) => e.date === key);
            const isToday = key === new Date().toISOString().slice(0, 10);
            return (
              <div className={`min-h-36 rounded-[22px] border bg-white p-3 shadow-soft ${isToday ? "border-[#E57200]" : "border-stone-200"}`} key={key}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${isToday ? "bg-[#E57200] text-white" : "bg-stone-100 text-stone-500"}`}>{day.getDate()}</div>
                <div className="mt-2 space-y-1.5">
                  {todaysEvents.map((e) => (
                    <div className="rounded-xl bg-stone-50 p-2 text-xs font-bold text-[#172033]" key={e.id}>{e.company}: {e.title.slice(0, 34)}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
