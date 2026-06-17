"use client";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { loadLocal, saveLocal } from "@/lib/storage";
import { makeId } from "@/lib/utils";
type Field = { key: string; label: string; type?: "text" | "date" | "textarea" | "url" };
type Row = Record<string, string>;
export function CrudClient({ title, storageKey, seedRows, fields }: { title: string; storageKey: string; seedRows: Row[]; fields: Field[] }) {
  const [rows, setRows] = useState<Row[]>(() => loadLocal(storageKey, seedRows));
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null | undefined>(undefined);
  function persist(next: Row[]) { setRows(next); saveLocal(storageKey, next); }
  function saveRow(row: Row) { const payload = { ...row, id: row.id || makeId("row") }; const exists = rows.some((r)=>r.id===payload.id); persist(exists ? rows.map((r)=>r.id===payload.id ? payload : r) : [payload, ...rows]); setEditing(undefined); }
  const filtered = useMemo(() => { const q = query.toLowerCase().trim(); return rows.filter((r) => !q || Object.values(r).join(" ").toLowerCase().includes(q)); }, [rows, query]);
  return (
    <div className="space-y-5">
      <div className="card p-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h1 className="text-4xl font-black tracking-tight">{title}</h1><p className="mt-2 text-stone-600">Add, edit, delete, search. Saves locally for now.</p></div><button className="btn" onClick={()=>setEditing(null)}><Plus size={16}/> Add</button></div></div>
      <section className="card p-4"><div className="relative"><Search className="absolute left-3 top-2.5 text-stone-400" size={18}/><input className="input pl-10" placeholder={`Search ${title.toLowerCase()}...`} value={query} onChange={(e)=>setQuery(e.target.value)}/></div></section>
      <section className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="bg-stone-100 text-xs uppercase tracking-wider text-stone-500"><tr>{fields.slice(0,5).map((f)=><th className="p-4" key={f.key}>{f.label}</th>)}<th className="p-4">Notes</th><th className="p-4">Actions</th></tr></thead><tbody>{filtered.map((row)=><tr className="border-t border-stone-200" key={row.id}>{fields.slice(0,5).map((f)=><td className="p-4" key={f.key}>{row[f.key] || "—"}</td>)}<td className="max-w-sm p-4 text-sm text-stone-600">{row.notes || "—"}</td><td className="p-4"><div className="flex gap-2"><button className="btn-secondary" onClick={()=>setEditing(row)}>Edit</button><button className="btn-danger" onClick={()=>persist(rows.filter((r)=>r.id!==row.id))}><Trash2 size={14}/></button></div></td></tr>)}</tbody></table></div></section>
      {editing !== undefined ? <CrudModal fields={fields} initial={editing ?? {}} title={title} onSave={saveRow} onCancel={()=>setEditing(undefined)}/> : null}
    </div>
  );
}
function CrudModal({ title, fields, initial, onSave, onCancel }: { title: string; fields: Field[]; initial: Row; onSave: (row: Row) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Row>(initial);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"><form className="card max-h-[92vh] w-full max-w-3xl overflow-auto p-6" onSubmit={(e)=>{e.preventDefault(); onSave(form);}}><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-black">Add / Edit {title}</h2><button className="btn-secondary" type="button" onClick={onCancel}>Close</button></div><div className="grid gap-3 md:grid-cols-2">{fields.map((field)=><label className={field.type==="textarea" ? "md:col-span-2" : ""} key={field.key}><span className="label">{field.label}</span>{field.type==="textarea" ? <textarea className="input min-h-28" value={form[field.key] || ""} onChange={(e)=>setForm({...form,[field.key]:e.target.value})}/> : <input className="input" type={field.type || "text"} value={form[field.key] || ""} onChange={(e)=>setForm({...form,[field.key]:e.target.value})}/>}</label>)}</div><div className="mt-5 flex gap-2"><button className="btn">Save</button><button className="btn-secondary" type="button" onClick={onCancel}>Cancel</button></div></form></div>;
}
