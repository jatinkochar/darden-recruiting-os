import type { RecruitingEvent } from "@/types";

type EmailInput = { subject: string; body: string; from?: string };

const NON_EVENT = [
  /congrats.*fort[eé]/i, /fort[eé].*fellowship/i, /receipt/i, /invoice/i,
  /password reset/i, /verification code/i, /newsletter/i
];

const EVENT = [
  /event/i, /webinar/i, /session/i, /office/i, /spotlight/i, /registered/i,
  /confirmed/i, /rsvp/i, /register/i, /calendar/i, /zoom/i, /meet\.google/i,
  /teams\.microsoft/i, /webex/i, /coffee chat/i, /career/i, /orientation/i,
  /networking/i, /panel/i, /workshop/i, /logistics/i, /q&a/i
];

function stripHtml(input: string) {
  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#40;/g, "(")
    .replace(/&#41;/g, ")")
    .replace(/&#91;/g, "[")
    .replace(/&#93;/g, "]")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeSubject(subject: string) {
  return subject
    .replace(/^(re|fw|fwd):\s*/gi, "")
    .replace(/^reminder:\s*/i, "")
    .replace(/\[reminder\s*&\s*zoom link\]\s*/i, "")
    .replace(/\[.*?event reminder\]\s*/i, "")
    .replace(/^confirmed:\s*/i, "")
    .replace(/^you're registered for\s*/i, "")
    .replace(/^you are registered for\s*/i, "")
    .replace(/^thank you for registering for\s*/i, "")
    .replace(/\s*[-–]\s*reminder\s*&\s*logistics\s*$/i, "")
    .replace(/\s*[-–]\s*event reminder\s*$/i, "")
    .replace(/\b24\s*hour reminder:?\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function company(text: string) {
  const s = text.toLowerCase();
  if (s.includes("mckinsey") || s.includes("@mckinsey.com")) return "McKinsey";
  if (s.includes("bain") || s.includes("@bain.com") || s.includes("atbain.co") || s.includes("bain.avature.net")) return "Bain";
  if (s.includes("bcg") || s.includes("@bcg.com") || s.includes("bcg.eightfold.ai")) return "BCG";
  if (s.includes("darden") || s.includes("virginia.edu") || s.includes("uva")) return "Darden";
  if (s.includes("atkearney") || s.includes("kearney")) return "Kearney";
  if (s.includes("deloitte")) return "Deloitte";
  if (s.includes("strategy&") || s.includes("pwc")) return "PwC / Strategy&";
  if (s.includes("ey-parthenon") || s.includes("ey parthenon")) return "EY-Parthenon";
  return "";
}

function eventType(text: string) {
  const s = text.toLowerCase();
  if (s.includes("coffee")) return "Coffee Chat";
  if (s.includes("case")) return "Case Workshop";
  if (s.includes("office") || s.includes("spotlight") || s.includes("home office")) return "Office Spotlight";
  if (s.includes("webinar")) return "Webinar";
  if (s.includes("panel")) return "Panel";
  if (s.includes("networking")) return "Networking";
  if (s.includes("orientation") || s.includes("isop")) return "Orientation";
  return "Recruiting";
}

function isLikelyEvent(subject: string, body: string) {
  const text = `${subject}\n${body}`;
  if (NON_EVENT.some((p) => p.test(text))) return false;
  return EVENT.some((p) => p.test(text));
}

function cleanUrl(url: string) {
  return url.replace(/[)\].,;]+$/, "").replace(/&amp;/g, "&").trim();
}

function urls(text: string) {
  return Array.from(text.matchAll(/https?:\/\/[^\s<>"']+/gi)).map((m) => cleanUrl(m[0]));
}

function meetingLink(text: string) {
  const all = urls(text);
  return all.find((u) => /zoom\.us|meet\.google\.com|teams\.microsoft\.com|webex\.com/i.test(u)) || "";
}

function registrationLink(text: string) {
  const all = urls(text);
  return all.find((u) => /register|rsvp|event|eightfold|atbain|bcg|technolutions|apply|avature/i.test(u)) || all.find((u) => /webex\.com|zoom\.us/i.test(u)) || "";
}

function passcode(text: string) {
  const m =
    text.match(/passcode:\s*([A-Za-z0-9!@#$%^&*._-]+)/i) ||
    text.match(/password:\s*([A-Za-z0-9!@#$%^&*._-]+)/i) ||
    text.match(/pwd=([A-Za-z0-9!@#$%^&*._-]+)/i);
  return m?.[1] || "";
}

function currentYear() {
  return new Date().getFullYear();
}

function parseDateString(value: string) {
  const cleaned = value
    .replace(/\b(today|tomorrow)\b,?/gi, "")
    .replace(/(\d+)(st|nd|rd|th)/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();

  const hasYear = /\b20\d{2}\b/.test(cleaned);
  const withYear = hasYear ? cleaned : `${cleaned}, ${currentYear()}`;
  const d = new Date(withYear);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return "";
}

function date(text: string) {
  const lines = text.split(/\n| {2,}/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const m = line.match(/\bDate\s*:\s*(.+)$/i);
    if (m) {
      const parsed = parseDateString(m[1]);
      if (parsed) return parsed;
    }
  }

  const patterns = [
    /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+([A-Za-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d{2})/i,
    /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+([A-Za-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?/i,
    /([A-Za-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d{2})/i,
    /(\d{1,2})\s+([A-Za-z]{3,9})\s+(20\d{2})/i,
    /(20\d{2})-(\d{2})-(\d{2})/
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (!m) continue;
    if (p === patterns[4]) return m[0];

    const parsed = parseDateString(m[0]);
    if (parsed) return parsed;
  }

  return "";
}

function to24(t: string) {
  const m = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (!m) return "";
  let h = Number(m[1]);
  const min = m[2] || "00";
  const ap = m[3].toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}

function startTime(text: string) {
  const lines = text.split(/\n| {2,}/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const m = line.match(/\b(Time|Start Time)\s*:\s*(.+)$/i);
    if (m) {
      const t = m[2].match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
      if (t) return to24(t[0]);
    }
  }

  const m = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  return m ? to24(m[0]) : "";
}

function endTime(text: string) {
  const m = text.match(/[-–]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  return m ? to24(m[0]) : "";
}

function timezone(text: string) {
  const m = text.match(/\b(ET|EST|EDT|PT|PST|PDT|MST|MDT|CT|CST|CDT|UTC|GMT|IST)\b/i);
  return m ? m[1].toUpperCase() : "";
}

function stableId(c: string, title: string, d: string, t: string) {
  return `event-${`${c}|${title}|${d}|${t}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 140) || "unknown"}`;
}

function cleanNotes(body: string) {
  const plain = stripHtml(body);
  const linkList = urls(plain)
    .filter((u) => !/privacy|unsubscribe|tracking|trk|ltrk/i.test(u))
    .slice(0, 4);

  const useful = plain
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^view in browser/i.test(l))
    .filter((l) => !/^unsubscribe/i.test(l))
    .filter((l) => !/^privacy/i.test(l))
    .filter((l) => !/^copyright/i.test(l))
    .filter((l) => !/bain\.avature\.net\/ltrk/i.test(l))
    .filter((l) => l.length < 260)
    .slice(0, 8);

  return [
    passcode(plain) ? `Passcode: ${passcode(plain)}` : "",
    linkList.length ? `Links:\n${linkList.join("\n")}` : "",
    useful.length ? `Details:\n${useful.join("\n")}` : ""
  ].filter(Boolean).join("\n\n").slice(0, 700);
}

export function parseRecruitingEmail(input: EmailInput): RecruitingEvent | null {
  const body = stripHtml(input.body || "");
  const text = `${input.subject}\n${input.from || ""}\n${body}`;
  if (!isLikelyEvent(input.subject, body)) return null;

  const c = company(text);
  if (!c) return null;

  const title = normalizeSubject(input.subject);
  const d = date(text);
  const st = startTime(text);

  const status =
    /confirmed|registered|admitted|you.?re registered|thank you for registering/i.test(text) ? "Registered" :
    /invite|invitation/i.test(text) ? "Invite Found" :
    /register|rsvp|sign up/i.test(text) ? "Register" :
    "Invite Found";

  return {
    id: stableId(c, title, d, st),
    title,
    company: c,
    type: eventType(text),
    date: d,
    startTime: st,
    endTime: endTime(text),
    timezone: timezone(text),
    status: status as any,
    priority: (["McKinsey", "Bain", "BCG"].includes(c) || /invite only|selected|exclusive|deadline|interview/i.test(text)) ? "High" : "Medium",
    location: meetingLink(text) ? "Virtual" : "",
    meetingLink: meetingLink(text),
    registrationLink: registrationLink(text),
    passcode: passcode(text),
    source: /reminder|24\s*hour/i.test(input.subject + body) ? "Gmail Reminder" : "Gmail",
    notes: cleanNotes(body)
  };
}
