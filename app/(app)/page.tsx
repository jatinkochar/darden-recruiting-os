import events from "@/data/events.json";
import contacts from "@/data/contacts.json";
import tasks from "@/data/tasks.json";
import { EventCard } from "@/components/events/EventCard";
import { StatCard } from "@/components/ui/StatCard";
import { computedStatus, eventDate } from "@/lib/utils";
import type { RecruitingEvent } from "@/types";
export default function Page() {
  const allEvents = events as RecruitingEvent[];
  const upcoming = allEvents.filter((event) => { const d = eventDate(event); return d && d >= new Date(new Date().toDateString()); }).sort((a, b) => Number(eventDate(a)) - Number(eventDate(b)));
  const stats = [
    { label: "Events", value: allEvents.length },
    { label: "Upcoming", value: upcoming.length },
    { label: "Today", value: allEvents.filter((e) => computedStatus(e) === "Happening Today").length },
    { label: "MBB", value: allEvents.filter((e) => ["McKinsey", "Bain", "BCG"].includes(e.company)).length },
    { label: "Contacts", value: contacts.length },
    { label: "Open Tasks", value: tasks.filter((t) => t.status !== "Done").length }
  ];
  return <div className="space-y-6"><section className="card p-8"><div className="text-xs font-black uppercase tracking-widest text-clay">Jatin Kochar · MBA Recruiting</div><h1 className="mt-3 text-5xl font-black tracking-tight text-stone-950 md:text-7xl">Darden Recruiting OS</h1><p className="mt-4 max-w-3xl text-stone-600">One command center for MBB events, Darden sessions, networking CRM, applications, tasks, meeting links, passcodes, and notes.</p></section><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">{stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section><section><div className="mb-3 flex items-center justify-between"><h2 className="text-2xl font-black tracking-tight">Next Events</h2><a className="font-bold text-clay" href="/events">View all</a></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{upcoming.slice(0, 6).map((event) => <EventCard key={event.id} event={event} />)}</div></section></div>;
}
