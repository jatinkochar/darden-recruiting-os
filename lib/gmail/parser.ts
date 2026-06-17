import type { RecruitingEvent } from "@/types";
import { makeId } from "@/lib/utils";

function findCompany(text: string) {
  const s = text.toLowerCase();
  if (s.includes("mckinsey")) return "McKinsey";
  if (s.includes("bain")) return "Bain";
  if (s.includes("bcg")) return "BCG";
  if (s.includes("darden") || s.includes("virginia.edu") || s.includes("uva")) return "Darden";
  return "";
}

function findFirstUrl(text: string, pattern: RegExp) {
  const urls = text.match(/https?:\/\/[^\s<>"')]+/gi) || [];
  const found = urls.find((u) => pattern.test(u));
  return found ? found.replace(/[.,;]+$/, "") : "";
}

function normalizeDate(input: string) {
  const d = new Date(input.replace(/(\d+)(st|nd|rd|th)/gi, "$1"));
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function findDate(text: string) {
  const patterns = [
    /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,\s+(\d{4})/i,
    /([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,\s+(\d{4})/i,
    /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return normalizeDate(m.slice(1).join(" "));
  }
  return "";
}

function to24(time: string) {
  const m = time.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (!m) return "";
  let h = Number(m[1]);
  if (m[3].toLowerCase() === "pm" && h < 12) h += 12;
  if (m[3].toLowerCase() === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

function findTime(text: string) {
  const m = text.match(/(\d{1,2}:\d{2})\s*(am|pm)/i);
  return m ? to24(m[0]) : "";
}

function findTimezone(text: string) {
  const m = text.match(/\b(ET|EST|EDT|PT|PST|PDT|MST|MDT|CT|CST|CDT)\b/i);
  return m ? m[1].toUpperCase() : "";
}

function findPasscode(text: string) {
  const m = text.match(/Passcode:\s*([A-Za-z0-9]+)/i);
  return m ? m[1] : "";
}

export function parseRecruitingEmail(input: { subject: string; body: string; from?: string }): RecruitingEvent | null {
  const text = `${input.subject}\n${input.from || ""}\n${input.body}`;
  const company = findCompany(text);
  if (!company) return null;
  if (!/(event|webinar|session|office|spotlight|registered|confirmed|rsvp|register|career|orientation|coffee|zoom|meet|teams)/i.test(text)) return null;

  const status = /confirmed|registered|thank you for registering/i.test(text) ? "Registered" : /register|rsvp|sign up/i.test(text) ? "Register" : "Invite Found";

  return {
    id: makeId("gmail"),
    title: input.subject.replace(/^Reminder:\s*/i, "").replace(/^You're Registered for\s*/i, "").trim(),
    company,
    type: /coffee/i.test(text) ? "Coffee Chat" : /webinar/i.test(text) ? "Webinar" : /office|spotlight/i.test(text) ? "Office Spotlight" : "Recruiting",
    date: findDate(text),
    startTime: findTime(text),
    endTime: "",
    timezone: findTimezone(text),
    status: status as any,
    priority: ["McKinsey", "Bain", "BCG"].includes(company) ? "High" : "Medium",
    location: /zoom|meet\.google|teams\.microsoft/i.test(text) ? "Virtual" : "",
    meetingLink: findFirstUrl(text, /zoom\.us|meet\.google|teams\.microsoft/i),
    registrationLink: findFirstUrl(text, /register|rsvp|event|eightfold|atbain|bcg|technolutions/i),
    passcode: findPasscode(text),
    source: "Gmail",
    notes: "Auto-extracted from Gmail sync."
  };
}
