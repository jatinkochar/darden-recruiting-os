"use client";
import { useState } from "react";
import type { RecruitingEvent, EventStatus, Priority } from "@/types";
import { makeId } from "@/lib/utils";
const statuses: EventStatus[] = ["Invite Found", "Register", "Registered", "Attended", "Follow-up Pending", "Completed", "Manual Entry"];
const priorities: Priority[] = ["High", "Medium", "Low"];
const emptyEvent: RecruitingEvent = { id: "", title: "", company: "", type: "Recruiting", date: "", startTime: "", endTime: "", timezone: "ET", status: "Register", priority: "High", location: "Virtual", meetingLink: "", registrationLink: "", passcode: "", source: "Manual", notes: "" };
export function EventForm({ initial, onSave, onCancel }: { initial?: RecruitingEvent; onSave: (event: RecruitingEvent) => void; onCancel: () => void }) {
  const [form, setForm] = useState<RecruitingEvent>(initial ?? emptyEvent);
  function update<K extends keyof RecruitingEvent>(key: K, value: RecruitingEvent[K]) { setForm((prev) => ({ ...prev, [key]: value })); }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
    <form className="card max-h-[92vh] w-full max-w-3xl overflow-auto p-6" onSubmit={(e) => { e.preventDefault(); onSave({ ...form, id: form.id || makeId("event") }); }}>
      <div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-black">{form.id ? "Edit Event" : "Add Event"}</h2><button type="button" className="btn-secondary" onClick={onCancel}>Close</button></div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Title"><input className="input" required value={form.title} onChange={(e) => update("title", e.target.value)} /></Field>
        <Field label="Company"><input className="input" required value={form.company} onChange={(e) => update("company", e.target.value)} /></Field>
        <Field label="Type"><input className="input" value={form.type} onChange={(e) => update("type", e.target.value)} /></Field>
        <Field label="Date"><input className="input" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} /></Field>
        <Field label="Start Time"><input className="input" type="time" value={form.startTime} onChange={(e) => update("startTime", e.target.value)} /></Field>
        <Field label="End Time"><input className="input" type="time" value={form.endTime} onChange={(e) => update("endTime", e.target.value)} /></Field>
        <Field label="Timezone"><input className="input" value={form.timezone} onChange={(e) => update("timezone", e.target.value)} /></Field>
        <Field label="Location"><input className="input" value={form.location} onChange={(e) => update("location", e.target.value)} /></Field>
        <Field label="Status"><select className="input" value={form.status} onChange={(e) => update("status", e.target.value as EventStatus)}>{statuses.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Priority"><select className="input" value={form.priority} onChange={(e) => update("priority", e.target.value as Priority)}>{priorities.map((p) => <option key={p}>{p}</option>)}</select></Field>
        <Field label="Meeting Link"><input className="input" value={form.meetingLink} onChange={(e) => update("meetingLink", e.target.value)} /></Field>
        <Field label="Registration Link"><input className="input" value={form.registrationLink} onChange={(e) => update("registrationLink", e.target.value)} /></Field>
        <Field label="Passcode"><input className="input" value={form.passcode} onChange={(e) => update("passcode", e.target.value)} /></Field>
        <Field label="Source"><input className="input" value={form.source} onChange={(e) => update("source", e.target.value)} /></Field>
        <div className="md:col-span-2"><Field label="Notes"><textarea className="input min-h-28" value={form.notes} onChange={(e) => update("notes", e.target.value)} /></Field></div>
      </div>
      <div className="mt-5 flex gap-2"><button className="btn" type="submit">Save Event</button><button className="btn-secondary" type="button" onClick={onCancel}>Cancel</button></div>
    </form>
  </div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className="label">{label}</span>{children}</label>; }
