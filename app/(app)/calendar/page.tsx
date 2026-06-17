import events from "@/data/events.json";
import { CalendarClient } from "@/components/calendar/CalendarClient";
import type { RecruitingEvent } from "@/types";
export default function CalendarPage() { return <CalendarClient events={events as RecruitingEvent[]} />; }
