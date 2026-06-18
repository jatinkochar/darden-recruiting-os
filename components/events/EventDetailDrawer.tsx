"use client";

import { Copy, ExternalLink, X } from "lucide-react";
import type { RecruitingEvent } from "@/types";
import { computedStatus } from "@/lib/utils";

type EventWithExtra = RecruitingEvent & {
  userNotes?: string;
  user_notes?: string;
  emailBody?: string;
  email_body?: string;
};

type Props = {
  event: EventWithExtra | null;
  timezone: string;
  onClose: () => void;
  onSaveNotes: (event: EventWithExtra, notes: string) => void;
  onEdit?: (event: RecruitingEvent) => void;
  onDelete?: (id: string) => void;
};

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

function formatDate(event: RecruitingEvent, timezone = "local") {
  if (!event.date) return "Date TBD";
  const time = event.startTime && /^\d{2}:\d{2}/.test(event.startTime) ? event.startTime.slice(0, 5) : "12:00";
  const d = new Date(`${event.date}T${time}:00`);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: timezone === "local" ? undefined : timezone
  }).format(d);
}

function formatTime(event: RecruitingEvent) {
  const start = cleanTime(event.startTime);
  const end = cleanTime(event.endTime);
  if (!start && !end) return event.timezone || "Time TBD";
  if (start && end) return `${start} – ${end}${event.timezone ? ` ${event.timezone}` : ""}`;
  return `${start || end}${event.timezone ? ` ${event.timezone}` : ""}`;
}

function getEmailBody(event: EventWithExtra) {
  return event.emailBody || event.email_body || event.notes || "";
}

function getUserNotes(event: EventWithExtra) {
  return event.userNotes || event.user_notes || "";
}

export function EventDetailDrawer({ event, timezone, onClose, onSaveNotes, onEdit, onDelete }: Props) {
  if (!event) return null;

  const status = computedStatus(event);
  const emailBody = getEmailBody(event);
  const userNotes = getUserNotes(event);

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-stone-950/30" onClick={onClose} aria-label="Close drawer" />
      <aside className="absolute right-0 top-0 h-full w-full overflow-y-auto bg-[#fbf7f1] p-5 shadow-2xl md:w-[520px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-clay">{event.company || "Company"}</div>
            <h2 className="mt-2 text-3xl font-black leading-tight tracking-tight text-stone-950">{event.title}</h2>
            <div className="mt-2 text-sm font-bold text-stone-500">{event.type || "Event"} · {status}</div>
          </div>
          <button className="rounded-full bg-white p-2 shadow" onClick={onClose}><X size={20} /></button>
        </div>

        <section className="mt-5 grid gap-3 rounded-3xl border border-stone-200 bg-white/80 p-4">
          <Info label="Date" value={formatDate(event, timezone)} />
          <Info label="Time" value={formatTime(event)} />
          <Info label="Location" value={event.location || "Location TBD"} />
          <Info label="Status" value={status} />
          <Info label="Priority" value={event.priority || "—"} />
          <Info label="Passcode" value={event.passcode || "—"} />
        </section>

        <section className="mt-5 flex flex-wrap gap-2">
          {event.meetingLink ? <a className="btn" href={event.meetingLink} target="_blank"><ExternalLink size={16}/> Join Meeting</a> : null}
          {event.registrationLink ? <a className="btn-secondary" href={event.registrationLink} target="_blank">Register</a> : null}
          {event.meetingLink ? <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(event.meetingLink || "")}><Copy size={16}/> Copy Link</button> : null}
          {event.passcode ? <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(event.passcode || "")}>Copy Passcode</button> : null}
        </section>

        <section className="mt-5 rounded-3xl border border-stone-200 bg-white/80 p-4">
          <div className="text-sm font-black uppercase tracking-widest text-stone-500">My Notes</div>
          <textarea
            className="mt-3 min-h-40 w-full rounded-2xl border border-stone-200 bg-white p-4 text-sm outline-none focus:border-stone-400"
            defaultValue={userNotes}
            placeholder="Add your own notes, questions, people met, follow-ups..."
            onBlur={(e) => onSaveNotes(event, e.target.value)}
          />
          <p className="mt-2 text-xs font-bold text-stone-400">Autosaves when you click outside the note box.</p>
        </section>

        <details className="mt-5 rounded-3xl border border-stone-200 bg-white/80 p-4">
          <summary className="cursor-pointer text-sm font-black uppercase tracking-widest text-stone-500">Original Email / Imported Details</summary>
          <pre className="mt-4 whitespace-pre-wrap break-words rounded-2xl bg-stone-50 p-4 text-xs leading-relaxed text-stone-700">{emailBody || "No imported email body available."}</pre>
        </details>

        <section className="mt-5 flex gap-2">
          {onEdit ? <button className="btn-secondary" onClick={() => onEdit(event)}>Edit</button> : null}
          {onDelete ? <button className="rounded-full bg-red-100 px-4 py-3 text-sm font-black text-red-700" onClick={() => onDelete(event.id)}>Delete</button> : null}
        </section>
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
      <div className="font-black uppercase tracking-widest text-stone-400">{label}</div>
      <div className="font-bold text-stone-900">{value}</div>
    </div>
  );
}
