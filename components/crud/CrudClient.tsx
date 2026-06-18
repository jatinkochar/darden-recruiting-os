"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { loadLocal, saveLocal } from "@/lib/storage";
import { makeId } from "@/lib/utils";

type Field = { key: string; label: string; type?: "text" | "date" | "textarea" | "url" };
type Row = Record<string, string>;

function friendlyTitle(title: string) {
  if (title === "Networking CRM") return "People";
  return title;
}

function friendlySubtitle(title: string) {
  if (title === "Applications") return "Track roles, deadlines, links, and notes in one clean pipeline.";
  if (title === "Networking CRM") return "Your recruiting relationships, coffee chats, mentors, and follow-ups.";
  if (title === "Tasks") return "Keep the small things moving so the big things feel less scary.";
  return "Add, edit, delete, and search.";
}

function statusTone(value?: string) {
  const v = (value || "").toLowerCase();
  if (v.includes("offer") || v.includes("done") || v.includes("submitted") || v.includes("active")) return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (v.includes("interview") || v.includes("final") || v.includes("today")) return "bg-[#FFF3E7] text-[#B85C00] border-[#FFE0BD]";
  if (v.includes("reject") || v.includes("withdraw")) return "bg-red-50 text-red-700 border-red-100";
  return "bg-[#E8F3F8] text-[#005587] border-[#CFE7F1]";
}

function firstValue(row: Row, keys: string[]) {
  for (const key of keys) if (row[key]) return row[key];
  return "—";
}

export function CrudClient({ title, storageKey, seedRows, fields }: { title: string; storageKey: string; seedRows: Row[]; fields: Field[] }) {
  const [rows, setRows] = useState<Row[]>(() => loadLocal(storageKey, seedRows));
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null | undefined>(undefined);

  function persist(next: Row[]) {
    setRows(next);
    saveLocal(storageKey, next);
  }

  function saveRow(row: Row) {
    const payload = { ...row, id: row.id || makeId("row") };
    const exists = rows.some((r) => r.id === payload.id);
    persist(exists ? rows.map((r) => r.id === payload.id ? payload : r) : [payload, ...rows]);
    setEditing(undefined);
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return rows.filter((r) => !q || Object.values(r).join(" ").toLowerCase().includes(q));
  }, [rows, query]);

  const heroTitle = friendlyTitle(title);
  const primaryField = fields[0]?.key || "title";
  const secondaryField = fields[1]?.key || "company";
  const statusField = fields.find((f) => f.key.toLowerCase().includes("status"))?.key;
  const dateField = fields.find((f) => f.type === "date")?.key;

  return (
    <div className="space-y-5">
      <div className="rounded-[32px] border border-stone-200 bg-white p-7 shadow-medium">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[#E57200]">Compass</div>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#172033]">{heroTitle}</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-stone-600">{friendlySubtitle(title)}</p>
          </div>
          <button className="btn" onClick={() => setEditing(null)}><Plus size={16} /> Add {heroTitle === "People" ? "person" : heroTitle.slice(0, -1).toLowerCase()}</button>
        </div>
      </div>

      <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input className="input pl-12" placeholder={`Search ${heroTitle.toLowerCase()}...`} value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex gap-2 text-sm font-black text-stone-500">
            <span className="rounded-full bg-stone-100 px-3 py-2">{filtered.length} visible</span>
            <span className="rounded-full bg-[#FFF3E7] px-3 py-2 text-[#B85C00]">{rows.length} total</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((row) => (
          <article key={row.id} className="rounded-[26px] border border-stone-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-[#E57200]/30 hover:shadow-medium">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-black uppercase tracking-[0.14em] text-stone-400">{firstValue(row, [secondaryField, "company", "role", "office"])}</div>
                <h3 className="mt-2 line-clamp-2 text-xl font-black leading-tight tracking-tight text-[#172033]">{row[primaryField] || row.company || row.title || row.name || "Untitled"}</h3>
              </div>
              {statusField ? <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${statusTone(row[statusField])}`}>{row[statusField] || "Active"}</span> : null}
            </div>

            <div className="mt-5 grid gap-2 text-sm font-bold text-stone-600">
              {fields.slice(1, 5).map((field) => (
                <div key={field.key} className="flex justify-between gap-4 rounded-2xl bg-stone-50 px-3 py-2">
                  <span className="text-stone-400">{field.label}</span>
                  <span className="truncate text-right text-[#172033]">{row[field.key] || "—"}</span>
                </div>
              ))}
            </div>

            {row.notes ? <p className="mt-4 line-clamp-3 text-sm font-medium leading-relaxed text-stone-600">{row.notes}</p> : null}

            <div className="mt-5 flex flex-wrap gap-2">
              {row.link ? <a href={row.link} target="_blank" className="btn-secondary px-3 py-2 text-xs">Open link</a> : null}
              {row.linkedin ? <a href={row.linkedin} target="_blank" className="btn-secondary px-3 py-2 text-xs">LinkedIn</a> : null}
              {dateField && row[dateField] ? <span className="rounded-full bg-[#FFF3E7] px-3 py-2 text-xs font-black text-[#B85C00]">{row[dateField]}</span> : null}
              <button className="btn-secondary px-3 py-2 text-xs" onClick={() => setEditing(row)}>Edit</button>
              <button className="rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-700" onClick={() => persist(rows.filter((r) => r.id !== row.id))}><Trash2 size={14} /></button>
            </div>
          </article>
        ))}
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-stone-200 bg-white p-10 text-center shadow-soft">
          <div className="text-xl font-black text-[#172033]">Nothing here yet.</div>
          <p className="mt-2 text-sm text-stone-500">Add the first item and Compass will keep it tidy.</p>
        </div>
      ) : null}

      {editing !== undefined ? <CrudModal fields={fields} initial={editing ?? {}} title={heroTitle} onSave={saveRow} onCancel={() => setEditing(undefined)} /> : null}
    </div>
  );
}

function CrudModal({ title, fields, initial, onSave, onCancel }: { title: string; fields: Field[]; initial: Row; onSave: (row: Row) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Row>(initial);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172033]/40 p-4 backdrop-blur-sm">
      <form className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-[30px] border border-stone-200 bg-white p-6 shadow-lg" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-[#E57200]">Compass</div>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-[#172033]">Add / Edit {title}</h2>
          </div>
          <button className="btn-secondary" type="button" onClick={onCancel}>Close</button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {fields.map((field) => (
            <label className={field.type === "textarea" ? "md:col-span-2" : ""} key={field.key}>
              <span className="label">{field.label}</span>
              {field.type === "textarea" ? (
                <textarea className="input min-h-28" value={form[field.key] || ""} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} />
              ) : (
                <input className="input" type={field.type || "text"} value={form[field.key] || ""} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} />
              )}
            </label>
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button className="btn">Save</button>
          <button className="btn-secondary" type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
