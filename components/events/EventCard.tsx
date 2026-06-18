"use client";

import { CalendarDays, Clock, ExternalLink, MapPin } from "lucide-react";
import type { RecruitingEvent } from "@/types";
import { computedStatus } from "@/lib/utils";

type Props = {
  event: RecruitingEvent;
  onOpen?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  timezone?: string;
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
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: timezone === "local" ? undefined : timezone
  }).format(d);
}

function formatTime(event: RecruitingEvent) {
  const start = cleanTime(event.startTime);
  const end = cleanTime(event.endTime);
  if (!start && !end) return event.timezone || "Time TBD";
  if (start && end) return `${start}–${end}${event.timezone ? ` ${event.timezone}` : ""}`;
  return `${start || end}${event.timezone ? ` ${event.timezone}` : ""}`;
}

function badgeClass(status: string) {
  if (status === "Registered") return "bg-emerald-100 text-emerald-700";
  if (status === "Happening Today") return "bg-amber-100 text-amber-800";
  if (status === "Ended") return "bg-stone-100 text-stone-500";
  if (status === "Invite Found") return "bg-blue-100 text-blue-700";
  return "bg-yellow-100 text-yellow-800";
}

function shortPasscode(passcode?: string) {
  if (!passcode) return "";
  return passcode.length > 18 ? `${passcode.slice(0, 15)}…` : passcode;
}

export function EventCard({ event, onOpen, onEdit, onDelete, timezone = "local" }: Props) {
  const status = computedStatus(event);

  return (
    <article className="card group cursor-pointer p-5 transition hover:-translate-y-0.5 hover:shadow-xl" onClick={onOpen}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-black text-stone-500">{event.company || "Company"} · {event.type || "Event"}</div>
          <h3 className="mt-2 line-clamp-3 text-xl font-black leading-tight tracking-tight text-stone-950">{event.title || "Untitled Event"}</h3>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${badgeClass(status)}`}>{status}</span>
      </div>

      <div className="mt-4 grid gap-2 text-sm font-bold text-stone-700">
        <div className="flex items-center gap-2"><CalendarDays size={16} className="shrink-0 text-stone-400" />{formatDate(event, timezone)}</div>
        <div className="flex items-center gap-2"><Clock size={16} className="shrink-0 text-stone-400" />{formatTime(event)}</div>
        <div className="flex items-center gap-2"><MapPin size={16} className="shrink-0 text-stone-400" />{event.location || "Location TBD"}</div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {event.meetingLink ? <a className="btn px-3 py-2 text-xs" href={event.meetingLink} target="_blank"><ExternalLink size={14} /> Join</a> : null}
        {event.registrationLink ? <a className="btn-secondary px-3 py-2 text-xs" href={event.registrationLink} target="_blank">Register</a> : null}
        {event.passcode ? (
          <span title={event.passcode} className="max-w-full truncate rounded-full bg-stone-100 px-3 py-2 text-xs font-black text-stone-700">
            Passcode: {shortPasscode(event.passcode)}
          </span>
        ) : null}
        {onEdit ? <button className="btn-secondary px-3 py-2 text-xs" onClick={onEdit}>Edit</button> : null}
        {onDelete ? <button className="rounded-full bg-red-100 px-3 py-2 text-xs font-black text-red-700" onClick={onDelete}>Delete</button> : null}
      </div>
    </article>
  );
}
