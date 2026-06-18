"use client";

import { useEffect, useMemo, useState } from "react";
import eventsSeed from "@/data/events.json";
import contacts from "@/data/contacts.json";
import tasks from "@/data/tasks.json";
import { EventCard } from "@/components/events/EventCard";
import { StatCard } from "@/components/ui/StatCard";
import { computedStatus, eventDate, fromSnakeEvent } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { RecruitingEvent } from "@/types";

export function DashboardClient() {
  const [events, setEvents] = useState<RecruitingEvent[]>(eventsSeed as RecruitingEvent[]);
  const [source, setSource] = useState<"seed" | "supabase">("seed");

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true, nullsFirst: false });

      if (!error && data && data.length) {
        setEvents(data.map(fromSnakeEvent));
        setSource("supabase");
      }
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

  const stats = [
    { label: "Events", value: events.length },
    { label: "Upcoming", value: upcoming.length },
    { label: "Today", value: events.filter((e) => computedStatus(e) === "Happening Today").length },
    { label: "MBB", value: events.filter((e) => ["McKinsey", "Bain", "BCG"].includes(e.company)).length },
    { label: "Contacts", value: contacts.length },
    { label: "Open Tasks", value: tasks.filter((t) => t.status !== "Done").length }
  ];

  return (
    <div className="space-y-6">
      <section className="card p-8">
        <div className="text-xs font-black uppercase tracking-widest text-clay">
          Jatin Kochar · MBA Recruiting · {source}
        </div>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-stone-950 md:text-7xl">
          Darden Recruiting OS
        </h1>
        <p className="mt-4 max-w-3xl text-stone-600">
          Command center for MBB events, Darden sessions, calendar, CRM, applications, tasks, meeting links,
          passcodes, and notes.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight">Next Events</h2>
          <a className="font-bold text-clay" href="/events">View all</a>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {upcoming.slice(0, 6).map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      </section>
    </div>
  );
}
