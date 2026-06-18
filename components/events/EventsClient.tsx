"use client";

import { useEffect, useMemo, useState } from "react";
import { Grid2X2, List, Plus, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import type { RecruitingEvent } from "@/types";
import { computedStatus, eventDate } from "@/lib/utils";
import { loadLocal, saveLocal } from "@/lib/storage";
import { EventCard } from "@/components/events/EventCard";
import { EventForm } from "@/components/events/EventForm";
import { EventDetailDrawer } from "@/components/events/EventDetailDrawer";
import { StatCard } from "@/components/ui/StatCard";

const KEY = "darden-os-events-multi-user";

type DateFilter = "upcoming" | "today" | "next7" | "next30" | "all" | "ended" | "missing";
type DuplicateMode = "hide" | "show";
type ViewMode = "cards" | "list";

type EventWithExtra = RecruitingEvent & {
  userNotes?: string;
  user_notes?: string;
  emailBody?: string;
  email_body?: string;
};

const TIMEZONES = [
  { label: "Local", value: "local" },
  { label: "ET", value: "America/New_York" },
  { label: "PT", value: "America/Los_Angeles" },
  { label: "CT", value: "America/Chicago" },
  { label: "UTC", value: "UTC" },
  { label: "IST", value: "Asia/Kolkata" }
];

function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/^(re:|fw:|fwd:)\s*/g, "")
    .replace(/^jatin,\s*/g, "")
    .replace(/^confirmed:\s*/g, "")
    .replace(/^you are confirmed to attend\s*/g, "")
    .replace(/^you are registered for\s*/g, "")
    .replace(/^you're registered for\s*/g, "")
    .replace(/^thank you for registering for\s*/g, "")
    .replace(/^reminder:\s*/g, "")
    .replace(/\b24\s*hour reminder:?\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function duplicateKey(event: RecruitingEvent) {
  const company = (event.company || "").toLowerCase().trim();
  const date = event.date || "";
  const time = event.startTime || "";
  const title = normalizeTitle(event.title)
    .replace(/\b(mckinsey|early access|experiencebain|experience bain|event|session|webinar|office|spotlight|meet the|confirmed|admitted|prospective|student|counseling)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .slice(0, 32);

  return `${company}|${date}|${time}|${title}`;
}

function scoreEvent(event: RecruitingEvent) {
  return (
    (event.status === "Registered" ? 30 : 0) +
    (event.meetingLink ? 20 : 0) +
    (event.registrationLink ? 10 : 0) +
    (event.passcode ? 8 : 0) +
    (!/reminder|confirmed to attend/i.test(event.title) ? 10 : 0)
  );
}

function collapseDuplicates(events: EventWithExtra[]) {
  const groups = new Map<string, EventWithExtra[]>();
  for (const event of events) {
    const key = duplicateKey(event);
    groups.set(key, [...(groups.get(key) || []), event]);
  }

  return Array.from(groups.values()).map((group) => {
    if (group.length === 1) return group[0];
    const best = [...group].sort((a, b) => scoreEvent(b) - scoreEvent(a))[0];

    return {
      ...best,
      meetingLink: best.meetingLink || group.find((e) => e.meetingLink)?.meetingLink || "",
      registrationLink: best.registrationLink || group.find((e) => e.registrationLink)?.registrationLink || "",
      passcode: best.passcode || group.find((e) => e.passcode)?.passcode || "",
      status: group.some((e) => e.status === "Registered") ? "Registered" : best.status
    };
  });
}

function isWithinDateFilter(event: RecruitingEvent, filter: DateFilter) {
  const status = computedStatus(event);
  const d = eventDate(event);
  const today = new Date(new Date().toDateString());

  if (filter === "all") return true;
  if (filter === "ended") return status === "Ended";
  if (filter === "missing") return !event.date;
  if (filter === "today") return status === "Happening Today";
  if (!d) return false;
  if (filter === "upcoming") return d >= today && status !== "Ended";

  const limit = new Date(today);
  if (filter === "next7") limit.setDate(limit.getDate() + 7);
  if (filter === "next30") limit.setDate(limit.getDate() + 30);

  return d >= today && d <= limit && status !== "Ended";
}

function cleanTime(value?: string) {
  if (!value) return "";
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value;
  let hour = Number(match[1]);
  const minute = match[2];
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return minute === "00" ? `${hour} ${suffix}` : `${hour}:${minute} ${suffix}`;
}

function displayDate(event: RecruitingEvent, timezone: string) {
  if (!event.date) return "Date TBD";
  const time = event.startTime && /^\d{2}:\d{2}/.test(event.startTime) ? event.startTime.slice(0, 5) : "12:00";
  const d = new Date(`${event.date}T${time}:00`);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: timezone === "local" ? undefined : timezone
  }).format(d);
}

function displayTime(event: RecruitingEvent) {
  const start = cleanTime(event.startTime);
  const end = cleanTime(event.endTime);
  if (start && end) return `${start}–${end}${event.timezone ? ` ${event.timezone}` : ""}`;
  return start || end || event.timezone || "Time TBD";
}

export function EventsClient({ seedEvents }: { seedEvents: RecruitingEvent[] }) {
  const [events, setEvents] = useState<EventWithExtra[]>(() => loadLocal(KEY, seedEvents));
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("upcoming");
  const [duplicateMode, setDuplicateMode] = useState<DuplicateMode>("hide");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [timezone, setTimezone] = useState("local");
  const [editing, setEditing] = useState<RecruitingEvent | null | undefined>(undefined);
  const [selected, setSelected] = useState<EventWithExtra | null>(null);

  useEffect(() => { void loadFromServer(); }, []);

  async function loadFromServer() {
    const res = await fetch("/api/events", { cache: "no-store" });
    if (!res.ok) { setMode("local"); return; }
    const json = await res.json();
    const next = json.events || [];
    setEvents(next);
    saveLocal(KEY, next);
    setMode("supabase");
  }

  async function saveEvent(event: EventWithExtra) {
    const exists = events.some((e) => e.id === event.id);
    const next = exists ? events.map((e) => e.id === event.id ? event : e) : [event, ...events];
    setEvents(next);
    saveLocal(KEY, next);

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event })
    });

    if (res.ok) await loadFromServer();
    setEditing(undefined);
  }

  async function saveNotes(event: EventWithExtra, notes: string) {
    const updated = { ...event, userNotes: notes, user_notes: notes };
    await saveEvent(updated);
    setSelected(updated);
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    const next = events.filter((e) => e.id !== id);
    setEvents(next);
    saveLocal(KEY, next);
    setSelected(null);
    await fetch(`/api/events?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  const displayEvents = useMemo(() => duplicateMode === "hide" ? collapseDuplicates(events) : events, [events, duplicateMode]);
  const companies = useMemo(() => Array.from(new Set(displayEvents.map((e) => e.company).filter(Boolean))).sort(), [displayEvents]);
  const statuses = useMemo(() => Array.from(new Set(displayEvents.map((e) => computedStatus(e)).filter(Boolean))).sort(), [displayEvents]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return displayEvents
      .filter((event) => {
        if (company && event.company !== company) return false;
        if (status && computedStatus(event) !== status && event.status !== status) return false;
        if (!isWithinDateFilter(event, dateFilter)) return false;
        if (q && !Object.values(event).join(" ").toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        const da = eventDate(a);
        const db = eventDate(b);
        if (!da && !db) return a.title.localeCompare(b.title);
        if (!da) return 1;
        if (!db) return -1;
        return Number(da) - Number(db);
      });
  }, [displayEvents, query, company, status, dateFilter]);

  const upcoming = displayEvents.filter((e) => {
    const d = eventDate(e);
    return d && d >= new Date(new Date().toDateString()) && computedStatus(e) !== "Ended";
  });

  return (
    <div className="space-y-5">
      <div className="card p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Events</h1>
            <p className="mt-2 text-stone-600">Compact event manager. Click any event to view details, imported email, and your personal notes.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="pill bg-stone-100 text-stone-700">{mode}</span>
            <button className="btn-secondary" onClick={loadFromServer}><RotateCcw size={16} /> Refresh</button>
            <button className="btn" onClick={() => setEditing(null)}><Plus size={16} /> Add Event</button>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Visible" value={filtered.length}/>
        <StatCard label="All Events" value={displayEvents.length}/>
        <StatCard label="Upcoming" value={upcoming.length}/>
        <StatCard label="Hidden Dups" value={Math.max(events.length - displayEvents.length, 0)}/>
      </section>

      <section className="card space-y-4 p-5">
        <div className="flex items-center gap-2 text-sm font-black text-stone-600">
          <SlidersHorizontal size={16}/> Filters
        </div>

        <div>
          <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-stone-500">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18}/>
            <input className="input w-full pl-12" placeholder="Search by company, event, notes, links..." value={query} onChange={(e)=>setQuery(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-6">
          <FilterSelect label="Date" value={dateFilter} onChange={(value)=>setDateFilter(value as DateFilter)}>
            <option value="upcoming">Upcoming</option><option value="today">Today</option><option value="next7">Next 7 days</option><option value="next30">Next 30 days</option><option value="missing">Missing date</option><option value="ended">Ended</option><option value="all">All dates</option>
          </FilterSelect>

          <FilterSelect label="Company" value={company} onChange={setCompany}>
            <option value="">All companies</option>{companies.map((c)=><option key={c}>{c}</option>)}
          </FilterSelect>

          <FilterSelect label="Status" value={status} onChange={setStatus}>
            <option value="">All statuses</option>{statuses.map((s)=><option key={s}>{s}</option>)}
          </FilterSelect>

          <FilterSelect label="Timezone" value={timezone} onChange={setTimezone}>
            {TIMEZONES.map((tz)=><option key={tz.value} value={tz.value}>{tz.label}</option>)}
          </FilterSelect>

          <FilterSelect label="Duplicates" value={duplicateMode} onChange={(value)=>setDuplicateMode(value as DuplicateMode)}>
            <option value="hide">Hide duplicates</option><option value="show">Show duplicates</option>
          </FilterSelect>

          <div>
            <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-stone-500">View</label>
            <div className="flex rounded-2xl border border-stone-200 bg-white p-1">
              <button aria-label="Card view" title="Cards" className={`flex flex-1 items-center justify-center rounded-xl px-3 py-2 ${viewMode === "cards" ? "bg-stone-900 text-white" : "text-stone-600"}`} onClick={()=>setViewMode("cards")}><Grid2X2 size={18}/></button>
              <button aria-label="List view" title="List" className={`flex flex-1 items-center justify-center rounded-xl px-3 py-2 ${viewMode === "list" ? "bg-stone-900 text-white" : "text-stone-600"}`} onClick={()=>setViewMode("list")}><List size={18}/></button>
            </div>
          </div>
        </div>
      </section>

      {viewMode === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((event)=><EventCard key={event.id} event={event} timezone={timezone} onOpen={()=>setSelected(event)} onEdit={()=>setEditing(event)} onDelete={()=>deleteEvent(event.id)} />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-white/70 text-xs font-black uppercase tracking-wider text-stone-500">
              <tr><th className="p-4">Company</th><th className="p-4">Event</th><th className="p-4">Date</th><th className="p-4">Time</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event.id} className="cursor-pointer border-b border-stone-100 hover:bg-white/70" onClick={()=>setSelected(event)}>
                  <td className="p-4 font-black">{event.company}</td>
                  <td className="p-4"><div className="font-black">{event.title}</div><div className="text-xs font-bold text-stone-500">{event.type}</div></td>
                  <td className="p-4 font-bold">{displayDate(event, timezone)}</td>
                  <td className="p-4 font-bold">{displayTime(event)}</td>
                  <td className="p-4"><span className="pill bg-stone-100 text-stone-700">{computedStatus(event)}</span></td>
                  <td className="p-4" onClick={(e)=>e.stopPropagation()}><div className="flex gap-2">{event.meetingLink ? <a className="btn px-3 py-2 text-xs" href={event.meetingLink} target="_blank">Join</a> : null}{event.registrationLink ? <a className="btn-secondary px-3 py-2 text-xs" href={event.registrationLink} target="_blank">Register</a> : null}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 ? <div className="card p-10 text-center text-stone-500">No events found for these filters.</div> : null}

      <EventDetailDrawer event={selected} timezone={timezone} onClose={()=>setSelected(null)} onSaveNotes={saveNotes} onEdit={(event)=>setEditing(event)} onDelete={deleteEvent} />

      {editing !== undefined ? <EventForm initial={editing ?? undefined} onSave={saveEvent} onCancel={()=>setEditing(undefined)}/> : null}
    </div>
  );
}

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-widest text-stone-500">{label}</span>
      <select className="input w-full min-w-0" value={value} onChange={(e)=>onChange(e.target.value)}>
        {children}
      </select>
    </label>
  );
}
