"use client";
import { useMemo, useState } from "react";
import type { RecruitingEvent } from "@/types";
import { formatTime, eventDate, computedStatus, statusClass } from "@/lib/utils";
import { Pill } from "@/components/ui/Pill";

export function CalendarClient({ events }: { events: RecruitingEvent[] }) {
  const [view, setView] = useState<"agenda" | "month">("agenda");
  const sorted = useMemo(() => [...events].sort((a,b) => Number(eventDate(a) || 9999999999999) - Number(eventDate(b) || 9999999999999)), [events]);
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
      <div className="card p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div><h1 className="text-4xl font-black tracking-tight">Calendar</h1><p className="mt-2 text-stone-600">Agenda and month view for all recruiting events.</p></div>
          <div className="flex gap-2"><button className={view==="agenda"?"btn":"btn-secondary"} onClick={()=>setView("agenda")}>Agenda</button><button className={view==="month"?"btn":"btn-secondary"} onClick={()=>setView("month")}>Month</button></div>
        </div>
      </div>
      {view === "agenda" ? (
        <div className="space-y-4">
          {Object.entries(byDate).map(([date, list]) => (
            <section className="card p-5" key={date}>
              <h2 className="text-xl font-black">{date}</h2>
              <div className="mt-4 divide-y divide-stone-200">
                {list.map((event) => (
                  <div className="flex flex-col justify-between gap-3 py-4 md:flex-row md:items-center" key={event.id}>
                    <div><div className="font-black">{event.title}</div><div className="text-sm text-stone-500">{event.company} · {formatTime(event)}</div></div>
                    <div className="flex flex-wrap gap-2"><Pill className={statusClass(computedStatus(event))}>{computedStatus(event)}</Pill>{event.meetingLink ? <a href={event.meetingLink} className="pill bg-stone-900 text-white" target="_blank">Join</a> : null}</div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="grid grid-cols-7 gap-2">
          {monthDays.map((day) => {
            const key = day.toISOString().slice(0,10);
            const todaysEvents = events.filter((e) => e.date === key);
            return (
              <div className="card min-h-32 p-3" key={key}>
                <div className="text-xs font-black text-stone-500">{day.getDate()}</div>
                <div className="mt-2 space-y-1">{todaysEvents.map((e) => <div className="rounded-xl bg-stone-100 p-2 text-xs font-bold" key={e.id}>{e.company}: {e.title.slice(0, 36)}</div>)}</div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
