import type { RecruitingEvent } from "@/types";
import { makeId } from "@/lib/utils";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export async function fetchGoogleCalendarEvents(accessToken: string): Promise<RecruitingEvent[]> {
  const timeMin = new Date();
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 180);

  const params = new URLSearchParams({
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "100",
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString()
  });

  const response = await fetch(`${CALENDAR_API}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Calendar events list failed: ${text}`);
  }

  const data = await response.json();
  const items = data.items || [];

  return items
    .filter((item: any) => {
      const blob = `${item.summary || ""} ${item.description || ""} ${item.location || ""}`.toLowerCase();
      return /(mckinsey|bain|bcg|darden|recruiting|career|coffee|webinar|consulting|mba)/i.test(blob);
    })
    .map((item: any) => {
      const startRaw = item.start?.dateTime || item.start?.date || "";
      const endRaw = item.end?.dateTime || item.end?.date || "";
      const start = startRaw ? new Date(startRaw) : null;
      const end = endRaw ? new Date(endRaw) : null;

      const summary = item.summary || "Calendar Event";
      const text = `${summary} ${item.description || ""} ${item.location || ""}`;
      const company =
        /mckinsey/i.test(text) ? "McKinsey" :
        /bain/i.test(text) ? "Bain" :
        /bcg/i.test(text) ? "BCG" :
        /darden|uva/i.test(text) ? "Darden" :
        "Calendar";

      const meetingLink =
        item.hangoutLink ||
        (item.description || "").match(/https?:\/\/(?:[\w.-]+\.)?(?:zoom\.us|teams\.microsoft\.com|meet\.google\.com)[^\s<>"')]+/i)?.[0] ||
        "";

      return {
        id: `gcal-${item.id || makeId("gcal")}`,
        title: summary,
        company,
        type: /coffee/i.test(text) ? "Coffee Chat" : /webinar/i.test(text) ? "Webinar" : "Calendar Event",
        date: start ? start.toISOString().slice(0, 10) : "",
        startTime: start && item.start?.dateTime ? start.toTimeString().slice(0, 5) : "",
        endTime: end && item.end?.dateTime ? end.toTimeString().slice(0, 5) : "",
        timezone: item.start?.timeZone || "",
        status: "Registered",
        priority: ["McKinsey", "Bain", "BCG"].includes(company) ? "High" : "Medium",
        location: item.location || "Calendar",
        meetingLink,
        registrationLink: item.htmlLink || "",
        passcode: "",
        source: "Google Calendar",
        notes: item.description ? String(item.description).slice(0, 500) : "Imported from Google Calendar."
      } satisfies RecruitingEvent;
    });
}
