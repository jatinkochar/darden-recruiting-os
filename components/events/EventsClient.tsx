"use client";
import { useMemo, useState } from "react";
import { Plus, RotateCcw, Search } from "lucide-react";
import type { RecruitingEvent } from "@/types";
import { eventDate } from "@/lib/utils";
import { loadLocal, saveLocal } from "@/lib/storage";
import { EventCard } from "@/components/events/EventCard";
import { EventForm } from "@/components/events/EventForm";
import { StatCard } from "@/components/ui/StatCard";
const KEY = "darden-os-events-v1-1";
export function EventsClient({ seedEvents }: { seedEvents: RecruitingEvent[] }) {
  const [events, setEvents] = useState<RecruitingEvent[]>(() => loadLocal(KEY, seedEvents));
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState("");
  const [editing, setEditing] = useState<RecruitingEvent | null | undefined>(undefined);
  function persist(next: RecruitingEvent[]) { setEvents(next); saveLocal(KEY, next); }
  function saveEvent(event: RecruitingEvent) { const exists = events.some((e) => e.id === event.id); persist(exists ? events.map((e) => e.id === event.id ? event : e) : [event, ...events]); setEditing(undefined); }
  function deleteEvent(id: string) { if (!confirm("Delete this event?")) return; persist(events.filter((e) => e.id !== id)); }
  const companies = useMemo(() => Array.from(new Set(events.map((e) => e.company).filter(Boolean))).sort(), [events]);
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return events.filter((event) => {
      if (company && event.company !== company) return false;
      if (q && !Object.values(event).join(" ").toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => {
      const da = eventDate(a); const db = eventDate(b);
      if (!da && !db) return a.title.localeCompare(b.title);
      if (!da) return 1; if (!db) return -1; return Number(da) - Number(db);
    });
  }, [events, query, company]);
  const upcoming = events.filter((e) => { const d = eventDate(e); return d && d >= new Date(new Date().toDateString()); });
  return <div className="space-y-5">
    <div className="card p-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h1 className="text-4xl font-black tracking-tight">Events</h1><p className="mt-2 text-stone-600">Add, edit, delete, search, and track meeting links. Saves in browser for now.</p></div><div className="flex gap-2"><button className="btn-secondary" onClick={() => persist(seedEvents)}><RotateCcw size={16} /> Reset</button><button className="btn" onClick={() => setEditing(null)}><Plus size={16} /> Add Event</button></div></div></div>
    <section className="grid gap-4 md:grid-cols-4"><StatCard label="Total" value={events.length} /><StatCard label="Upcoming" value={upcoming.length} /><StatCard label="Registered" value={events.filter((e) => e.status === "Registered").length} /><StatCard label="To Register" value={events.filter((e) => ["Register", "Manual Entry"].includes(e.status)).length} /></section>
    <section className="card grid gap-3 p-4 md:grid-cols-[1fr_220px]"><div className="relative"><Search className="absolute left-3 top-2.5 text-stone-400" size={18} /><input className="input pl-10" placeholder="Search events, notes, links..." value={query} onChange={(e) => setQuery(e.target.value)} /></div><select className="input" value={company} onChange={(e) => setCompany(e.target.value)}><option value="">All companies</option>{companies.map((c) => <option key={c}>{c}</option>)}</select></section>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((event) => <EventCard key={event.id} event={event} onEdit={() => setEditing(event)} onDelete={() => deleteEvent(event.id)} />)}</div>
    {filtered.length === 0 ? <div className="card p-10 text-center text-stone-500">No events found.</div> : null}
    {editing !== undefined ? <EventForm initial={editing ?? undefined} onSave={saveEvent} onCancel={() => setEditing(undefined)} /> : null}
  </div>;
}
