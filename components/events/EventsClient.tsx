"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RotateCcw, Search, Database, CloudOff, SlidersHorizontal } from "lucide-react";
import type { RecruitingEvent } from "@/types";
import { computedStatus, eventDate, fromSnakeEvent, toSnakeEvent } from "@/lib/utils";
import { loadLocal, saveLocal } from "@/lib/storage";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { EventCard } from "@/components/events/EventCard";
import { EventForm } from "@/components/events/EventForm";
import { StatCard } from "@/components/ui/StatCard";

const KEY = "darden-os-events-sprint-1-3";

type DateFilter = "upcoming" | "today" | "next7" | "next30" | "all" | "ended" | "missing";
type DuplicateMode = "hide" | "show";

function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/^(re:|fw:|fwd:)\s*/g, "")
    .replace(/^jatin,\s*/g, "")
    .replace(/^confirmed:\s*/g, "")
    .replace(/^you are confirmed to attend\s*/g, "")
    .replace(/^you're registered for\s*/g, "")
    .replace(/^you are registered for\s*/g, "")
    .replace(/^thank you for registering for\s*/g, "")
    .replace(/^reminder:\s*/g, "")
    .replace(/\b24\s*hour reminder:?\s*/g, "")
    .replace(/\s*[-–]\s*event reminder\s*$/g, "")
    .replace(/\s*\(option\s*\d+\s*(of\s*\d+)?\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleRoot(title: string) {
  return normalizeTitle(title)
    .replace(/\b(mckinsey|early access|experiencebain|experience bain|confirmed|admitted|prospective|student|counseling|event|session|webinar|office|spotlight|meet the|get to know|you are|to attend)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeetingHost(link: string) {
  try {
    if (!link) return "";
    const url = new URL(link);
    return `${url.hostname}${url.pathname}`.toLowerCase();
  } catch {
    return link.toLowerCase().slice(0, 80);
  }
}

function duplicateKey(event: RecruitingEvent) {
  const company = (event.company || "").toLowerCase().trim();
  const date = event.date || "";
  const time = event.startTime || "";
  const meeting = extractMeetingHost(event.meetingLink);

  if (company && date && time && meeting) return `${company}|${date}|${time}|${meeting}`;

  if (company && date && time) {
    const root = titleRoot(event.title);
    const officeHint =
      root.includes("atlanta") ? "atlanta" :
      root.includes("new york") ? "new-york" :
      root.includes("boston") ? "boston" :
      root.includes("miami") ? "miami" :
      root.includes("denver") ? "denver" :
      root.includes("chicago") ? "chicago" :
      root.includes("nj") || root.includes("new jersey") ? "new-jersey" :
      root.slice(0, 28);
    return `${company}|${date}|${time}|${officeHint}`;
  }

  return `${company}|${date}|${titleRoot(event.title).slice(0, 36)}`;
}

function eventScore(event: RecruitingEvent) {
  let score = 0;
  if (event.status === "Registered") score += 30;
  if (event.meetingLink) score += 20;
  if (event.registrationLink) score += 10;
  if (event.passcode) score += 8;
  if (event.notes && !event.notes.includes("<")) score += 5;
  if (!/reminder/i.test(event.title)) score += 8;
  if (!/^jatin,/i.test(event.title)) score += 8;
  if (!/confirmed to attend/i.test(event.title)) score += 6;
  if (event.source === "Google Calendar") score += 4;
  return score;
}

function collapseDuplicates(events: RecruitingEvent[]) {
  const groups = new Map<string, RecruitingEvent[]>();

  for (const event of events) {
    const key = duplicateKey(event);
    const existing = groups.get(key) || [];
    existing.push(event);
    groups.set(key, existing);
  }

  return Array.from(groups.values()).map((group) => {
    if (group.length === 1) return group[0];

    const sorted = [...group].sort((a, b) => eventScore(b) - eventScore(a));
    const best = sorted[0];

    const mergedNotes = Array.from(
      new Set(group.map((e) => e.notes).filter(Boolean))
    ).join("\n\n---\n\n").slice(0, 1000);

    return {
      ...best,
      meetingLink: best.meetingLink || group.find((e) => e.meetingLink)?.meetingLink || "",
      registrationLink: best.registrationLink || group.find((e) => e.registrationLink)?.registrationLink || "",
      passcode: best.passcode || group.find((e) => e.passcode)?.passcode || "",
      status: group.some((e) => e.status === "Registered") ? "Registered" : best.status,
      notes: mergedNotes || best.notes
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

export function EventsClient({ seedEvents }: { seedEvents: RecruitingEvent[] }) {
  const [events, setEvents] = useState<RecruitingEvent[]>(() => loadLocal(KEY, seedEvents));
  const [mode, setMode] = useState<"local" | "supabase">("local");
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("upcoming");
  const [duplicateMode, setDuplicateMode] = useState<DuplicateMode>("hide");
  const [editing, setEditing] = useState<RecruitingEvent | null | undefined>(undefined);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (supabase) {
      void loadFromSupabase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadFromSupabase() {
    if (!supabase) return;

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Supabase events load failed:", error.message);
      setMode("local");
      return;
    }

    if (!data || data.length === 0) {
      const rows = seedEvents.map(toSnakeEvent);
      const { error: seedError } = await supabase.from("events").upsert(rows);
      if (seedError) {
        console.error("Supabase seed failed:", seedError.message);
        setEvents(seedEvents);
        saveLocal(KEY, seedEvents);
        setMode("local");
        return;
      }

      setEvents(seedEvents);
      saveLocal(KEY, seedEvents);
      setMode("supabase");
      return;
    }

    const parsed = data.map(fromSnakeEvent);
    setEvents(parsed);
    saveLocal(KEY, parsed);
    setMode("supabase");
  }

  async function persist(next: RecruitingEvent[]) {
    setEvents(next);
    saveLocal(KEY, next);
  }

  async function saveEvent(event: RecruitingEvent) {
    const exists = events.some((e) => e.id === event.id);
    const next = exists ? events.map((e) => e.id === event.id ? event : e) : [event, ...events];

    await persist(next);

    if (supabase) {
      const { error } = await supabase.from("events").upsert(toSnakeEvent(event));
      if (error) {
        console.error("Supabase save failed:", error.message);
      } else {
        await loadFromSupabase();
      }
    }

    setEditing(undefined);
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;

    const next = events.filter((e) => e.id !== id);
    await persist(next);

    if (supabase) {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) console.error("Supabase delete failed:", error.message);
    }
  }

  async function resetEvents() {
    await persist(seedEvents);

    if (supabase) {
      const { error } = await supabase.from("events").upsert(seedEvents.map(toSnakeEvent));
      if (error) console.error("Supabase reset failed:", error.message);
      else await loadFromSupabase();
    }
  }

  const displayEvents = useMemo(() => {
    return duplicateMode === "hide" ? collapseDuplicates(events) : events;
  }, [events, duplicateMode]);

  const companies = useMemo(
    () => Array.from(new Set(displayEvents.map((e) => e.company).filter(Boolean))).sort(),
    [displayEvents]
  );

  const statuses = useMemo(
    () => Array.from(new Set(displayEvents.map((e) => computedStatus(e)).filter(Boolean))).sort(),
    [displayEvents]
  );

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
            <p className="mt-2 text-stone-600">
              Opens to upcoming events by default. Use filters to view ended, missing date, or all events.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="pill bg-stone-100 text-stone-700">
              {mode === "supabase" ? <Database size={14}/> : <CloudOff size={14}/>} {mode}
            </span>
            <button className="btn-secondary" onClick={resetEvents}>
              <RotateCcw size={16} /> Reset
            </button>
            <button className="btn" onClick={() => setEditing(null)}>
              <Plus size={16} /> Add Event
            </button>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Visible" value={filtered.length}/>
        <StatCard label="All Events" value={displayEvents.length}/>
        <StatCard label="Upcoming" value={upcoming.length}/>
        <StatCard label="Hidden Dups" value={Math.max(events.length - displayEvents.length, 0)}/>
      </section>

      <section className="card space-y-3 p-4">
        <div className="flex items-center gap-2 text-sm font-black text-stone-600">
          <SlidersHorizontal size={16} />
          Filters
        </div>

        <div className="grid gap-3 md:grid-cols-[1.3fr_repeat(5,minmax(130px,1fr))]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-stone-400" size={18}/>
            <input
              className="input pl-10"
              placeholder="Search events, notes, links..."
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
            />
          </div>

          <select className="input" value={dateFilter} onChange={(e)=>setDateFilter(e.target.value as DateFilter)}>
            <option value="upcoming">Upcoming</option>
            <option value="today">Today</option>
            <option value="next7">Next 7 days</option>
            <option value="next30">Next 30 days</option>
            <option value="missing">Missing date</option>
            <option value="ended">Ended</option>
            <option value="all">All dates</option>
          </select>

          <select className="input" value={company} onChange={(e)=>setCompany(e.target.value)}>
            <option value="">All companies</option>
            {companies.map((c)=><option key={c}>{c}</option>)}
          </select>

          <select className="input" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((s)=><option key={s}>{s}</option>)}
          </select>

          <select className="input" value={duplicateMode} onChange={(e)=>setDuplicateMode(e.target.value as DuplicateMode)}>
            <option value="hide">Hide duplicates</option>
            <option value="show">Show duplicates</option>
          </select>

          <button
            className="btn-secondary"
            onClick={() => {
              setQuery("");
              setCompany("");
              setStatus("");
              setDateFilter("upcoming");
              setDuplicateMode("hide");
            }}
          >
            Clear
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((event)=>
          <EventCard
            key={event.id}
            event={event}
            onEdit={()=>setEditing(event)}
            onDelete={()=>deleteEvent(event.id)}
          />
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-stone-500">
          No events found for these filters.
        </div>
      ) : null}

      {editing !== undefined ? (
        <EventForm
          initial={editing ?? undefined}
          onSave={saveEvent}
          onCancel={()=>setEditing(undefined)}
        />
      ) : null}
    </div>
  );
}
