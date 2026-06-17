import events from "@/data/events.json";
import { EventCard } from "@/components/events/EventCard";
import type { RecruitingEvent } from "@/types";
import { eventDate } from "@/lib/utils";

export default function EventsPage() {
  const allEvents = (events as RecruitingEvent[]).sort((a, b) => {
    const da = eventDate(a);
    const db = eventDate(b);
    if (!da && !db) return a.title.localeCompare(b.title);
    if (!da) return 1;
    if (!db) return -1;
    return Number(da) - Number(db);
  });

  return (
    <div className="space-y-5">
      <div className="card p-6">
        <h1 className="text-4xl font-black tracking-tight">Events</h1>
        <p className="mt-2 text-stone-600">
          Seeded with Gmail-extracted MBB and Darden events. Manual add/edit and database sync come in the next build.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {allEvents.map((event) => <EventCard event={event} key={event.id} />)}
      </div>
    </div>
  );
}
