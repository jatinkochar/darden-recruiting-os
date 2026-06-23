"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Flag,
  GripVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import type { Priority, Task } from "@/types";
import { loadLocal, saveLocal } from "@/lib/storage";
import { makeId } from "@/lib/utils";

type TaskStatus = Task["status"];

const COLUMNS: Array<{
  key: TaskStatus;
  title: string;
  helper: string;
  badge: string;
}> = [
  {
    key: "Backlog",
    title: "Backlog",
    helper: "Ideas and admin to park for later.",
    badge: "bg-slate-100 text-slate-700",
  },
  {
    key: "This Week",
    title: "This Week",
    helper: "What needs momentum soon.",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    key: "Today",
    title: "Today",
    helper: "Your focus list for now.",
    badge: "bg-amber-100 text-amber-800",
  },
  {
    key: "Done",
    title: "Done",
    helper: "Small wins, stacked up.",
    badge: "bg-emerald-100 text-emerald-700",
  },
];

const PRIORITIES: Priority[] = ["High", "Medium", "Low"];

function emptyTask(status: TaskStatus = "Backlog"): Task {
  return {
    id: makeId("task"),
    title: "",
    company: "",
    dueDate: "",
    status,
    priority: "Medium",
    notes: "",
  };
}

function priorityClass(priority: Priority) {
  if (priority === "High") return "bg-red-50 text-red-700";
  if (priority === "Medium") return "bg-amber-50 text-amber-700";
  return "bg-emerald-50 text-emerald-700";
}

function dueLabel(dueDate: string) {
  if (!dueDate) return "No due date";

  const parsed = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dueDate;

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(task: Task) {
  if (!task.dueDate || task.status === "Done") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(`${task.dueDate}T00:00:00`);
  return !Number.isNaN(due.getTime()) && due < today;
}

function statusIcon(status: TaskStatus) {
  if (status === "Done") return <CheckCircle2 size={16} />;
  if (status === "Today") return <Clock3 size={16} />;
  return <Flag size={16} />;
}

function KanbanTaskCard({
  task,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}) {
  return (
    <article
      draggable
      onDragEnd={onDragEnd}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", task.id);
        onDragStart(task.id);
      }}
      className="group rounded-[22px] border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-medium"
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          className="-ml-1 mt-0.5 rounded-xl p-1.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Drag task"
        >
          <GripVertical size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {task.company ? (
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                {task.company}
              </span>
            ) : (
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                General
              </span>
            )}

            {isOverdue(task) ? (
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-black text-red-700">
                Overdue
              </span>
            ) : null}
          </div>

          <h3 className="mt-2 line-clamp-3 text-lg font-black leading-tight tracking-tight text-slate-950">
            {task.title || "Untitled task"}
          </h3>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
          <CalendarDays size={15} className="text-slate-400" />
          <span>{dueLabel(task.dueDate)}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1.5 text-xs font-black ${priorityClass(task.priority)}`}>
            {task.priority}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
            {task.status}
          </span>
        </div>
      </div>

      {task.notes ? (
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600">
          {task.notes}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-secondary !min-h-9 !px-3 !py-2 !text-xs"
          onClick={() => onEdit(task)}
        >
          <Edit3 size={14} />
          Edit
        </button>

        <button
          type="button"
          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </article>
  );
}

function TaskModal({
  task,
  onClose,
  onSave,
}: {
  task: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}) {
  const [draft, setDraft] = useState<Task>(task);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E57200]">
              Compass Task
            </div>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
              {task.title ? "Edit task" : "Add task"}
            </h2>
          </div>

          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <label>
            <span className="label">Title</span>
            <input
              className="input"
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="Prepare questions for Bain coffee chat"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="label">Company</span>
              <input
                className="input"
                value={draft.company}
                onChange={(event) => setDraft({ ...draft, company: event.target.value })}
                placeholder="McKinsey, Bain, Amazon..."
              />
            </label>

            <label>
              <span className="label">Due Date</span>
              <input
                className="input"
                type="date"
                value={draft.dueDate}
                onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="label">Status</span>
              <select
                className="input"
                value={draft.status}
                onChange={(event) =>
                  setDraft({ ...draft, status: event.target.value as TaskStatus })
                }
              >
                {COLUMNS.map((column) => (
                  <option key={column.key} value={column.key}>
                    {column.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="label">Priority</span>
              <select
                className="input"
                value={draft.priority}
                onChange={(event) =>
                  setDraft({ ...draft, priority: event.target.value as Priority })
                }
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span className="label">Notes</span>
            <textarea
              className="input min-h-32 resize-y"
              value={draft.notes}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
              placeholder="Add links, talking points, next steps..."
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn" onClick={() => onSave(draft)}>
            Save task
          </button>
        </div>
      </div>
    </div>
  );
}

export function TasksKanbanClient({
  seedRows,
  storageKey,
}: {
  seedRows: Task[];
  storageKey: string;
}) {
  const [tasks, setTasks] = useState<Task[]>(() => loadLocal(storageKey, seedRows));
  const [query, setQuery] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);

  function persist(next: Task[]) {
    setTasks(next);
    saveLocal(storageKey, next);
  }

  function moveTask(id: string, status: TaskStatus) {
    persist(tasks.map((task) => (task.id === id ? { ...task, status } : task)));
  }

  function upsertTask(task: Task) {
    const cleaned: Task = {
      ...task,
      id: task.id || makeId("task"),
      title: task.title.trim() || "Untitled task",
      company: task.company.trim(),
      status: task.status || "Backlog",
      priority: task.priority || "Medium",
      notes: task.notes || "",
      dueDate: task.dueDate || "",
    };

    const exists = tasks.some((item) => item.id === cleaned.id);
    persist(exists ? tasks.map((item) => (item.id === cleaned.id ? cleaned : item)) : [cleaned, ...tasks]);
    setEditing(null);
  }

  function deleteTask(id: string) {
    const ok = confirm("Remove this task?");
    if (!ok) return;
    persist(tasks.filter((task) => task.id !== id));
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;

    return tasks.filter((task) =>
      [task.title, task.company, task.status, task.priority, task.notes, task.dueDate]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [tasks, query]);

  const grouped = useMemo(() => {
    return COLUMNS.reduce<Record<TaskStatus, Task[]>>(
      (acc, column) => {
        acc[column.key] = filtered.filter((task) => task.status === column.key);
        return acc;
      },
      {
        Backlog: [],
        "This Week": [],
        Today: [],
        Done: [],
      },
    );
  }, [filtered]);

  const dueToday = tasks.filter((task) => task.status === "Today").length;
  const completed = tasks.filter((task) => task.status === "Done").length;
  const overdue = tasks.filter(isOverdue).length;

  return (
    <div className="space-y-5">
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[#E57200]">
              Compass
            </div>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
              Tasks
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-600">
              Drag tasks across your board, keep the small stuff moving, and make recruiting feel less chaotic.
            </p>
          </div>

          <button
            type="button"
            className="btn"
            onClick={() => setEditing(emptyTask("Backlog"))}
          >
            <Plus size={16} />
            Add task
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card bg-[#232D4B] p-5 text-white">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/50">
            Total
          </div>
          <div className="mt-2 text-4xl font-black">{tasks.length}</div>
        </div>

        <div className="card p-5">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
            Today
          </div>
          <div className="mt-2 text-4xl font-black text-[#E57200]">{dueToday}</div>
        </div>

        <div className="card p-5">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
            Done
          </div>
          <div className="mt-2 text-4xl font-black text-emerald-700">{completed}</div>
        </div>

        <div className="card p-5">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
            Overdue
          </div>
          <div className="mt-2 text-4xl font-black text-red-700">{overdue}</div>
        </div>
      </div>

      <div className="card p-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="input !pl-11"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks, companies, notes..."
          />
        </label>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {COLUMNS.map((column) => {
          const columnTasks = grouped[column.key];
          const isOver = overColumn === column.key;

          return (
            <section
              key={column.key}
              onDragEnter={() => setOverColumn(column.key)}
              onDragLeave={() => setOverColumn(null)}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setOverColumn(column.key);
              }}
              onDrop={(event) => {
                event.preventDefault();
                const id = event.dataTransfer.getData("text/plain") || draggingId;
                if (id) moveTask(id, column.key);
                setDraggingId(null);
                setOverColumn(null);
              }}
              className={`min-h-[520px] rounded-[28px] border p-3 transition ${
                isOver
                  ? "border-[#E57200] bg-orange-50/70 shadow-medium"
                  : "border-slate-200 bg-white/70"
              }`}
            >
              <div className="mb-3 rounded-[22px] border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${column.badge}`}>
                        {statusIcon(column.key)}
                      </span>
                      <h2 className="text-lg font-black tracking-tight text-slate-950">
                        {column.title}
                      </h2>
                    </div>
                    <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">
                      {column.helper}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
                    {columnTasks.length}
                  </span>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl border border-dashed border-slate-300 px-3 py-2.5 text-sm font-black text-slate-600 transition hover:border-[#E57200] hover:bg-orange-50 hover:text-[#B85C00]"
                  onClick={() => setEditing(emptyTask(column.key))}
                >
                  + Add to {column.title}
                </button>
              </div>

              <div className="grid gap-3">
                {columnTasks.map((task) => (
                  <KanbanTaskCard
                    key={task.id}
                    task={task}
                    onEdit={setEditing}
                    onDelete={deleteTask}
                    onDragStart={setDraggingId}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setOverColumn(null);
                    }}
                  />
                ))}

                {!columnTasks.length ? (
                  <div className="rounded-[22px] border border-dashed border-slate-200 bg-white/70 p-6 text-center">
                    <p className="text-sm font-bold text-slate-500">
                      Drop a task here.
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      {editing ? (
        <TaskModal
          task={editing}
          onClose={() => setEditing(null)}
          onSave={upsertTask}
        />
      ) : null}
    </div>
  );
}
