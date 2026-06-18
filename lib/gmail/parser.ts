import type { RecruitingEvent } from "@/types";

type EmailInput = {
  subject: string;
  body: string;
  from?: string;
};

type ParsedDateTime = {
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
};

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const KNOWN_COMPANIES = [
  // Consulting
  ["McKinsey", /mckinsey|@mckinsey\.com|mckinsey\.avature\.net/i],
  ["Bain", /\bbain\b|@bain\.com|atbain\.co|bain\.avature\.net|experiencebain/i],
  ["BCG", /\bbcg\b|@bcg\.com|bcg\.eightfold\.ai|bcg\.com/i],
  ["Kearney", /atkearney|kearney|@kearney\.com/i],
  ["Deloitte", /deloitte/i],
  ["PwC / Strategy&", /strategy&|pwc/i],
  ["EY-Parthenon", /ey-parthenon|ey parthenon/i],
  ["EY", /\bey\b|ernst\s*&?\s*young/i],
  ["KPMG", /\bkpmg\b/i],
  ["Accenture", /accenture/i],
  ["Oliver Wyman", /oliver\s+wyman/i],
  ["LEK", /\blek\b|l\.e\.k/i],
  ["Roland Berger", /roland\s+berger/i],
  ["AlixPartners", /alixpartners/i],
  ["Alvarez & Marsal", /alvarez\s*&?\s*marsal|a&m/i],
  ["ZS", /\bzs\b|zs associates/i],
  ["Simon-Kucher", /simon[-\s]kucher/i],

  // Tech / product
  ["Amazon", /amazon|amazonjobs|aws/i],
  ["Google", /google|google careers/i],
  ["Microsoft", /microsoft/i],
  ["Apple", /\bapple\b/i],
  ["Meta", /\bmeta\b|facebook/i],
  ["Adobe", /adobe/i],
  ["NVIDIA", /nvidia/i],
  ["Salesforce", /salesforce/i],
  ["Uber", /\buber\b/i],
  ["Airbnb", /airbnb/i],
  ["Stripe", /stripe/i],
  ["OpenAI", /openai/i],
  ["Anthropic", /anthropic/i],
  ["Databricks", /databricks/i],
  ["Snowflake", /snowflake/i],
  ["Palantir", /palantir/i],
  ["Atlassian", /atlassian/i],
  ["ServiceNow", /servicenow/i],
  ["Capital One", /capital\s+one/i],

  // Finance / general
  ["Goldman Sachs", /goldman\s+sachs/i],
  ["Morgan Stanley", /morgan\s+stanley/i],
  ["J.P. Morgan", /j\.?p\.?\s*morgan|jpmorgan|jp morgan/i],
  ["BlackRock", /blackrock/i],
  ["Blackstone", /blackstone/i],
  ["KKR", /\bkkr\b/i],
  ["Apollo", /apollo/i],
  ["Evercore", /evercore/i],
  ["Lazard", /lazard/i],
  ["Citi", /\bciti\b|citigroup/i],
  ["Bank of America", /bank\s+of\s+america|bofa/i],
  ["Visa", /\bvisa\b/i],
  ["Mastercard", /mastercard/i],
  ["American Express", /american\s+express|amex/i],

  // School / career center
  ["Darden", /darden|virginia\.edu|uva|career center|career foundations/i],
] as const;

const STRONG_NEGATIVE = [
  /\bpayment\b/i,
  /\bcredit card\b/i,
  /\bdebit card\b/i,
  /\btransaction\b/i,
  /\bstatement\b/i,
  /\bbank account\b/i,
  /\bbill\b/i,
  /\binvoice\b/i,
  /\breceipt\b/i,
  /\border\b/i,
  /\bshipment\b/i,
  /\bdelivered\b/i,
  /\brefund\b/i,
  /\botp\b/i,
  /\bone[-\s]?time password\b/i,
  /\bverification code\b/i,
  /\bsecurity alert\b/i,
  /\bpassword reset\b/i,
  /\bsign[-\s]?in alert\b/i,
  /\blogin alert\b/i,
  /\bsubscription\b/i,
  /\bpromo code\b/i,
  /\bmarketing preference\b/i,
  /\bunsubscribe\b/i,
  /\bsent you a message\b/i,
  /\bmessage \d+ days? ago\b/i,
  /\bcongrats.*fort[eé]\b/i,
  /\bfort[eé].*fellowship\b/i,
];

const RECRUITING_SIGNALS: Array<[RegExp, number]> = [
  [/\binterview\b/i, 8],
  [/\bcase interview\b/i, 8],
  [/\bcoffee chat\b/i, 7],
  [/\boffice hours?\b/i, 7],
  [/\boffice spotlight\b/i, 7],
  [/\binformation session\b/i, 7],
  [/\binfo session\b/i, 7],
  [/\bwebinar\b/i, 6],
  [/\bpanel\b/i, 6],
  [/\bnetworking\b/i, 6],
  [/\brecruiting\b/i, 6],
  [/\bcampus recruiting\b/i, 7],
  [/\bcareer fair\b/i, 7],
  [/\bcareer center\b/i, 5],
  [/\bresume review\b/i, 6],
  [/\bworkshop\b/i, 5],
  [/\borientation\b/i, 5],
  [/\brsvp\b/i, 6],
  [/\bregister\b/i, 4],
  [/\bregistered\b/i, 5],
  [/\bconfirmed\b/i, 4],
  [/\binvite\b/i, 5],
  [/\binvitation\b/i, 5],
  [/\bjoin us\b/i, 4],
  [/\bcalendar invite\b/i, 7],
  [/\badd to calendar\b/i, 8],
  [/\bzoom\b/i, 5],
  [/\bwebex\b/i, 5],
  [/\bgoogle meet\b/i, 5],
  [/\bteams\.microsoft\.com\b/i, 5],
  [/\bdeadline\b/i, 5],
  [/\bapplication\b/i, 4],
  [/\bprospective student\b/i, 4],
  [/\bMBA\b/i, 2],
];

const GENERIC_EMAIL_PROVIDERS = new Set([
  "gmail",
  "googlemail",
  "outlook",
  "hotmail",
  "yahoo",
  "icloud",
  "aol",
  "protonmail",
  "mail",
  "zoom",
  "webex",
  "microsoft",
  "teams",
  "calendar",
  "mailchimp",
  "sendgrid",
  "salesforce",
  "hubspot",
  "substack",
  "medium",
  "linkedin",
]);

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
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
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
    .replace(/^confirmation:\s*/i, "")
    .replace(/^you'?re registered for\s*/i, "")
    .replace(/^you are registered for\s*/i, "")
    .replace(/^thank you for registering for\s*/i, "")
    .replace(/^you are confirmed to attend\s*/i, "")
    .replace(/^jatin,?\s*/i, "")
    .replace(/\s*[-–]\s*reminder\s*&\s*logistics\s*$/i, "")
    .replace(/\s*[-–]\s*event reminder\s*$/i, "")
    .replace(/\b24\s*hour reminder:?\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function urls(text: string) {
  return Array.from(text.matchAll(/https?:\/\/[^\s<>"']+/gi)).map((m) =>
    cleanUrl(m[0]),
  );
}

function cleanUrl(url: string) {
  return url.replace(/[)\].,;]+$/, "").replace(/&amp;/g, "&").trim();
}

function meetingLink(text: string) {
  const all = urls(text);
  return (
    all.find((u) =>
      /zoom\.us|meet\.google\.com|teams\.microsoft\.com|webex\.com/i.test(u),
    ) || ""
  );
}

function registrationLink(text: string) {
  const all = urls(text);
  return (
    all.find((u) =>
      /register|rsvp|event|events|career|eightfold|atbain|bcg|technolutions|apply|avature|yello|handshake/i.test(
        u,
      ),
    ) ||
    all.find((u) => /webex\.com|zoom\.us/i.test(u)) ||
    ""
  );
}

function passcode(text: string) {
  const m =
    text.match(/passcode:\s*([A-Za-z0-9!@#$%^&*._-]+)/i) ||
    text.match(/password:\s*([A-Za-z0-9!@#$%^&*._-]+)/i) ||
    text.match(/meeting password:\s*([A-Za-z0-9!@#$%^&*._-]+)/i) ||
    text.match(/pwd=([A-Za-z0-9!@#$%^&*._-]+)/i);
  return m?.[1] || "";
}

function currentYear() {
  return new Date().getFullYear();
}

function toIsoDate(year: number, monthIndex: number, day: number) {
  const d = new Date(Date.UTC(year, monthIndex, day));
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function monthIndex(raw: string) {
  return MONTHS[raw.toLowerCase().replace(".", "")];
}

function parseDateString(value: string) {
  const cleaned = value
    .replace(/\b(today|tomorrow)\b,?/gi, "")
    .replace(/(\d+)(st|nd|rd|th)/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || /tbd|to be announced|forthcoming|details to follow/i.test(cleaned)) return "";

  const iso = cleaned.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (iso) return toIsoDate(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  let m = cleaned.match(
    /\b(?:Mon|Monday|Tue|Tuesday|Wed|Wednesday|Thu|Thursday|Fri|Friday|Sat|Saturday|Sun|Sunday)?\.?,?\s*([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s*(20\d{2})?\b/i,
  );
  if (m) {
    const mi = monthIndex(m[1]);
    if (mi !== undefined) return toIsoDate(Number(m[3] || currentYear()), mi, Number(m[2]));
  }

  m = cleaned.match(/\b(\d{1,2})\s+([A-Za-z]{3,9})\.?,?\s*(20\d{2})?\b/i);
  if (m) {
    const mi = monthIndex(m[2]);
    if (mi !== undefined) return toIsoDate(Number(m[3] || currentYear()), mi, Number(m[1]));
  }

  return "";
}

function relevantLines(text: string) {
  return text
    .split(/\n| {2,}/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function date(text: string) {
  const lines = relevantLines(text);

  for (const line of lines) {
    const m =
      line.match(/\bDate\s*:\s*(.+)$/i) ||
      line.match(/\bWhen\s*:\s*(.+)$/i) ||
      line.match(/\bEvent Date\s*:\s*(.+)$/i);
    if (m) {
      const parsed = parseDateString(m[1]);
      if (parsed) return parsed;
    }
  }

  for (const line of lines) {
    if (!/(mon|tue|wed|thu|fri|sat|sun|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})/i.test(line)) continue;
    const parsed = parseDateString(line);
    if (parsed) return parsed;
  }

  return "";
}

function to24(raw: string, fallbackAmPm?: string) {
  const t = raw.trim();
  let m = t.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (!m && fallbackAmPm) {
    m = `${t} ${fallbackAmPm}`.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  }
  if (m) {
    let h = Number(m[1]);
    const min = m[2] || "00";
    const ap = m[3].toLowerCase();
    if (ap === "pm" && h < 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${min}`;
  }

  const military = t.match(/\b([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?\b/);
  if (military) return `${String(Number(military[1])).padStart(2, "0")}:${military[2]}`;

  return "";
}

function timeRange(text: string) {
  const lines = relevantLines(text);

  const candidates = [
    ...lines.filter((l) => /\b(Time|Start Time|When)\s*:/i.test(l)),
    ...lines,
  ];

  for (const line of candidates) {
    const range = line.match(
      /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|–|—|to)\s*(\d{1,2}(?::\d{2})?\s*(am|pm))\b/i,
    );
    if (range) {
      const ampm = range[3];
      return {
        startTime: to24(range[1], ampm),
        endTime: to24(range[2]),
      };
    }
  }

  for (const line of candidates) {
    const single = line.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
    if (single) return { startTime: to24(single[0]), endTime: "" };

    const military = line.match(/\b([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?\b/);
    if (military) return { startTime: to24(military[0]), endTime: "" };
  }

  return { startTime: "", endTime: "" };
}

function timezone(text: string) {
  const m = text.match(/\b(ET|EST|EDT|PT|PST|PDT|MST|MDT|MT|CT|CST|CDT|UTC|GMT|IST|Asia\/Kolkata|America\/New_York|America\/Los_Angeles)\b/i);
  return m ? m[1].toUpperCase() : "";
}

function location(text: string, link: string) {
  if (link || /\bvirtual\b|\bonline\b|\bzoom\b|\bwebex\b|\bgoogle meet\b|\bteams\b/i.test(text)) return "Virtual";

  for (const line of relevantLines(text)) {
    const m =
      line.match(/\bLocation\s*:\s*(.+)$/i) ||
      line.match(/\bWhere\s*:\s*(.+)$/i);
    if (m && !/tbd|to be announced/i.test(m[1])) return m[1].slice(0, 80);
  }

  return "";
}

function eventType(text: string) {
  const s = text.toLowerCase();
  if (s.includes("coffee")) return "Coffee Chat";
  if (s.includes("case")) return "Case Workshop";
  if (s.includes("office hours")) return "Office Hours";
  if (s.includes("office") || s.includes("spotlight") || s.includes("home office")) return "Office Spotlight";
  if (s.includes("webinar")) return "Webinar";
  if (s.includes("panel")) return "Panel";
  if (s.includes("networking")) return "Networking";
  if (s.includes("career fair")) return "Career Fair";
  if (s.includes("resume")) return "Resume Review";
  if (s.includes("orientation") || s.includes("isop")) return "Orientation";
  if (s.includes("interview")) return "Interview";
  if (s.includes("deadline") || s.includes("application")) return "Application";
  return "Recruiting";
}

function recruitingScore(subject: string, body: string, from = "") {
  const text = `${subject}\n${from}\n${body}`;
  let score = 0;

  for (const [pattern, points] of RECRUITING_SIGNALS) {
    if (pattern.test(text)) score += points;
  }

  if (meetingLink(text)) score += 5;
  if (registrationLink(text)) score += 4;
  if (date(text) && timeRange(text).startTime) score += 5;

  if (/careers?|recruiting|campus|events?|talent|students?|admissions/i.test(from)) score += 5;
  if (/no-?reply|noreply/i.test(from) && /calendar|event|register|rsvp|webinar|zoom|webex/i.test(text)) score += 2;

  for (const [, pattern] of KNOWN_COMPANIES) {
    if (pattern.test(text)) {
      score += 3;
      break;
    }
  }

  for (const pattern of STRONG_NEGATIVE) {
    if (pattern.test(text)) score -= 14;
  }

  return score;
}

function isLikelyRecruitingEvent(subject: string, body: string, from = "") {
  const text = `${subject}\n${from}\n${body}`;

  const hasStrongNegative = STRONG_NEGATIVE.some((p) => p.test(text));
  const hasStrongEventSignal =
    /\b(interview|webinar|office hours?|office spotlight|coffee chat|information session|info session|rsvp|calendar invite|add to calendar|career fair|resume review)\b/i.test(text) ||
    meetingLink(text);

  if (hasStrongNegative && !hasStrongEventSignal) return false;

  return recruitingScore(subject, body, from) >= 9;
}

function company(text: string, from = "") {
  for (const [name, pattern] of KNOWN_COMPANIES) {
    if (pattern.test(text)) return name;
  }

  const fromDomain = from.match(/@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/i)?.[1] || "";
  const domainStem = fromDomain.split(".").filter(Boolean)[0]?.toLowerCase();
  if (domainStem && !GENERIC_EMAIL_PROVIDERS.has(domainStem)) {
    return domainStem
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  const subjectEntity =
    text.match(/\b(?:Join|Meet|Experience|Explore|Discover|Careers? at|Coffee chat with|Interview with)\s+([A-Z][A-Za-z&.\-]+(?:\s+[A-Z][A-Za-z&.\-]+){0,3})/)?.[1] ||
    text.match(/\b([A-Z][A-Za-z&.\-]+(?:\s+[A-Z][A-Za-z&.\-]+){0,2})\s+(?:Coffee Chat|Webinar|Office|Panel|Information Session|Info Session|Interview|Careers?)/)?.[1];

  if (subjectEntity && !/Date|Time|Location|Virtual|Register|Reminder|Confirmed|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Monday/.test(subjectEntity)) {
    return subjectEntity.trim();
  }

  return "Recruiting";
}

function parseDateTime(text: string): ParsedDateTime {
  const range = timeRange(text);
  return {
    date: date(text),
    startTime: range.startTime,
    endTime: range.endTime,
    timezone: timezone(text),
  };
}

function stableId(c: string, title: string, d: string, t: string) {
  return `event-${`${c}|${title}|${d}|${t}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 140) || "unknown"}`;
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
    .filter((l) => !/avature\.net\/ltrk|utm_|click\./i.test(l))
    .filter((l) => l.length < 260)
    .slice(0, 8);

  return [
    passcode(plain) ? `Passcode: ${passcode(plain)}` : "",
    linkList.length ? `Links:\n${linkList.join("\n")}` : "",
    useful.length ? `Details:\n${useful.join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 900);
}

export function parseRecruitingEmail(input: EmailInput): RecruitingEvent | null {
  const body = stripHtml(input.body || "");
  const text = `${input.subject}\n${input.from || ""}\n${body}`;

  if (!isLikelyRecruitingEvent(input.subject || "", body, input.from || "")) {
    return null;
  }

  const c = company(text, input.from);
  const title = normalizeSubject(input.subject || "Recruiting event");
  const parsed = parseDateTime(text);
  const meet = meetingLink(text);
  const registration = registrationLink(text);

  const status =
    /confirmed|registered|admitted|you.?re registered|thank you for registering|you are confirmed/i.test(text)
      ? "Registered"
      : /invite|invitation/i.test(text)
        ? "Invite Found"
        : /register|rsvp|sign up/i.test(text)
          ? "Register"
          : "Invite Found";

  const score = recruitingScore(input.subject || "", body, input.from || "");

  return {
    id: stableId(c, title, parsed.date, parsed.startTime),
    title,
    company: c,
    type: eventType(text),
    date: parsed.date,
    startTime: parsed.startTime,
    endTime: parsed.endTime,
    timezone: parsed.timezone,
    status: status as any,
    priority: score >= 20 || /invite only|selected|exclusive|deadline|interview|final round/i.test(text) ? "High" : score >= 13 ? "Medium" : "Low",
    location: location(text, meet),
    meetingLink: meet,
    registrationLink: registration,
    passcode: passcode(text),
    source: /reminder|24\s*hour/i.test(input.subject + body) ? "Gmail Reminder" : "Gmail",
    notes: cleanNotes(body),
  };
}
