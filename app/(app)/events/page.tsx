import events from "@/data/events.json";
import { EventsClient } from "@/components/events/EventsClient";
import type { RecruitingEvent } from "@/types";
export default function EventsPage() { return <EventsClient seedEvents={events as RecruitingEvent[]} />; }
