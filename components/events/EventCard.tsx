import { ExternalLink, Mail } from "lucide-react";
import type { RecruitingEvent } from "@/types";
import { computedStatus, formatDate, formatTime, priorityClass, statusClass } from "@/lib/utils";
import { Pill } from "@/components/ui/Pill";

export function EventCard({ event }: { event: RecruitingEvent }) {
  const status = computedStatus(event);

  return (
    <article className="card overflow-hidden p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-black leading-tight tracking-tight text-stone-900">
            {event.title}
          </div>
          <div className="mt-1 text-sm font-bold text-stone-500">
            {event.company} · {event.type}
          </div>
        </div>
        <Pill className={statusClass(status)}>{status}</Pill>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Info label="Date" value={formatDate(event)} />
        <Info label="Time" value={formatTime(event)} />
        <Info label="Location" value={event.location || "—"} />
        <Info label="Passcode" value={event.passcode || "—"} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Pill className={priorityClass(event.priority)}>{event.priority}</Pill>
        {event.meetingLink ? (
          <a className="pill bg-stone-900 text-white" href={event.meetingLink} target="_blank">
            <ExternalLink size={13} />
            Join
          </a>
        ) : null}
        {event.registrationLink ? (
          <a className="pill bg-blue-100 text-blue-700" href={event.registrationLink} target="_blank">
            <ExternalLink size={13} />
            Register
          </a>
        ) : null}
        {event.source ? (
          <span className="pill bg-stone-100 text-stone-700">
            <Mail size={13} />
            {event.source}
          </span>
        ) : null}
      </div>

      {event.notes ? <p className="mt-4 text-sm leading-6 text-stone-600">{event.notes}</p> : null}
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white/60 p-3">
      <div className="text-[10px] font-black uppercase tracking-wider text-stone-400">{label}</div>
      <div className="mt-1 text-sm font-black text-stone-800">{value}</div>
    </div>
  );
}
