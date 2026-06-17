import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RecruitingEvent, EventStatus } from "@/types";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function eventDate(event: RecruitingEvent): Date | null { if (!event.date) return null; return new Date(`${event.date}T${event.startTime || "00:00"}`); }
export function computedStatus(event: RecruitingEvent): EventStatus {
  if (!event.date) return event.status || "Manual Entry";
  if (["Attended", "Completed", "Follow-up Pending"].includes(event.status)) return event.status;
  const today = new Date().toISOString().slice(0, 10);
  const d = eventDate(event);
  if (event.date === today) return "Happening Today";
  if (d && d < new Date()) return "Ended";
  return event.status || "Register";
}
export function formatDate(event: RecruitingEvent) {
  if (!event.date) return "Date TBD";
  return new Date(`${event.date}T00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
export function formatTime(event: RecruitingEvent) { return [event.startTime, event.endTime ? `– ${event.endTime}` : "", event.timezone].filter(Boolean).join(" ") || "Time TBD"; }
export function statusClass(status: string) {
  const s = status.toLowerCase();
  if (["registered", "attended", "completed"].includes(s)) return "bg-emerald-100 text-emerald-700";
  if (["register", "happening today", "manual entry", "follow-up pending"].includes(s)) return "bg-amber-100 text-amber-800";
  if (s === "ended") return "bg-stone-200 text-stone-600";
  return "bg-blue-100 text-blue-700";
}
export function priorityClass(priority: string) {
  if (priority === "High") return "bg-red-100 text-red-700";
  if (priority === "Medium") return "bg-amber-100 text-amber-800";
  return "bg-emerald-100 text-emerald-700";
}
export function makeId(prefix = "id") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
