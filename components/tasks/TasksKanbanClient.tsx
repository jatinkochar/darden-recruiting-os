"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  ExternalLink,
  Eye,
  FileText,
  Flag,
  GripVertical,
  Link as LinkIcon,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { loadLocal, saveLocal } from "@/lib/storage";
import { makeId } from "@/lib/utils";

type TaskStatus = "To Do" | "In Progress" | "Review" | "Done";
type TaskPriority = "High" | "Medium" | "Low";

export type CompassTask = {
  id: string;
  title: string;
  company: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  owner?: string;
  relatedTo?: string;
  taskType?: string;
  link?: string;
  nextStep?: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
};

const COLUMNS: Array<{
  key: TaskStatus;
  title: string;
  helper: string;
  icon: React.ReactNode;
  accent: string;
}> = [
  {
    key: "To Do",
    title: "To Do",
    helper: "Captured, not started yet.",
    icon: <Circle size={16} />,
    accent: "bg-slate-100 text-slate-700",
  },
  {
    key: "In Progress",
    title: "In Progress",
    helper: "Currently moving.",
    icon: <Clock3 size={16} />,
    accent: "bg-blue-100 text-blue-700",
  },
  {
    key: "Review",
    title: "Review",
    helper: "Waiting, checking, or blocked.",
    icon: <Eye size={16} />,
    accent: "bg-amber-100 text-amber-800",
  },
  {
    key: "Done",
    title: "Done",
    helper: "Finished. Nice.",
    icon: <CheckCircle2 size={16} />,
    accent: "bg-emerald-100 text-emerald-700",
  },
];

const PRIORITIES: TaskPriority[] = ["High", "Medium", "Low"];

const TASK_TYPES = [
  "Application",
  "Networking",
  "Event Prep",
  "Follow-up",
  "Resume",
  "Research",
  "Admin",
  "Other",
];

function mapStatus(status?: string): TaskStatus {
  if (!status) return "To Do";
  const s = status.toLowerCase();

  if (s.includes("done") || s.includes("complete")) return "Done";
  if (s.includes("review") || s.includes("blocked") || s.includes("waiting")) return "Review";
  if (s.includes("progress") || s.includes("doing")) return "In Progress";
  if (s.includes("today") || s.includes("week") || s.includes("backlog") || s.includes("pending")) return "To Do";

  return "To Do";
}

function mapPriority(priority?: string): TaskPriority {
  if (priority === "High" || priority === "Medium" || priority === "Low") return priority;
  return "Medium";
}

function normalizeTask(raw: Partial<CompassTask> & Record<string, any>): CompassTask {
  const now = new Date().toISOString();

  return {
    id: raw.id || makeId("task"),
    title: raw.title || "",
    company: raw.company || "",
    status: mapStatus(raw.status),
    priority: mapPriority(raw.priority),
    dueDate: raw.dueDate || "",
    owner: raw.owner || "",
    relatedTo: raw.relatedTo || raw.relatedEvent || raw.application || "",
    taskType: raw.taskType || raw.type || "Other",
    link: raw.link || raw.url || "",
    nextStep: raw.nextStep || "",
    notes: raw.notes || "",
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || now,
  };
}

function emptyTask(status: TaskStatus = "To Do"): CompassTask {
  return {
    id: makeId("task"),
    title: "",
    company: "",
    status,
    priority: "Medium",
    dueDate: "",
    owner: "",
    relatedTo: "",
    taskType: "Other",
    link: "",
    nextStep: "",
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function priorityClass(priority: TaskPriority) {
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

function isOverdue(task: CompassTask) {
  if (!task.dueDate || task.status === "Done") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(`${task.dueDate}T00:00:00`);
  return !Number.isNaN(due.getTime()) && due < today;
}

function isDueSoon(task: CompassTask) {
  if (!task.dueDate || task.status === "Done") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(`${task.dueDate}T00:00:00`);
  if (Number.isNaN(due.getTime())) return false;

  const diff = due.getTime() - today.getTime();
  return diff >= 0 && diff <= 3 * 24 * 60 * 60 * 1000;
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-black text-slate-900">
        {value || "—"}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onOpen,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
}: {
  task: CompassTask;
  onOpen: (task: CompassTask) => void;
  onEdit: (task: CompassTask) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}) {
  return (
    <article
      draggable
      onClick={() => onOpen(task)}
      onDragEnd={onDragEnd}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", task.id);
        onDragStart(task.id);
      }}
      className="group cursor-pointer rounded-[20px] border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-medium"
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="-ml-1 mt-0.5 shrink-0 rounded-xl p-1.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Drag task"
          onClick={(event) => event.stopPropagation()}
        >
          <GripVertical size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              {task.company || "General"}
            </span>

            <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${priorityClass(task.priority)}`}>
              {task.priority}
            </span>

            {isOverdue(task) ? (
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-black text-red-700">
                Overdue
              </span>
            ) : isDueSoon(task) ? (
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-black text-orange-700">
                Due soon
              </span>
            ) : null}
          </div>

          <h3 className="mt-2 line-clamp-3 text-lg font-black leading-tight tracking-tight text-slate-950">
            {task.title || "Untitled task"}
          </h3>

          <div className="mt-3 grid gap-2 text-sm font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <CalendarDays size={15} className="text-slate-400" />
              <span>{dueLabel(task.dueDate)}</span>
            </div>

            {task.taskType ? (
              <div className="flex items-center gap-2">
                <Briefcase size={15} className="text-slate-400" />
                <span>{task.taskType}</span>
              </div>
            ) : null}
          </div>

          {task.nextStep ? (
            <p className="mt-3 line-clamp-2 rounded-2xl bg-orange-50 px-3 py-2 text-xs font-bold leading-relaxed text-orange-800">
              Next: {task.nextStep}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          className="btn-secondary !min-h-9 !px-3 !py-2 !text-xs"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(task);
          }}
        >
          <Pencil size={14} />
          Edit
        </button>

        <button
          type="button"
          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(task.id);
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  );
}

function TaskDetailsOverlay({
  task,
  onClose,
  onEdit,
  onDelete,
  onMove,
}: {
  task: CompassTask;
  onClose: () => void;
  onEdit: (task: CompassTask) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: TaskStatus) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 p-3 backdrop-blur-sm">
      <aside className="flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.32)]">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E57200]">
                Task Details
              </div>
              <h2 className="mt-2 text-3xl font-black leading-tight tracking-tight text-slate-950">
                {task.title || "Untitled task"}
              </h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {task.company || "General"} · {task.taskType || "Task"}
              </p>
            </div>

            <button
              type="button"
              className="rounded-full border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
              onClick={onClose}
              aria-label="Close task details"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
              {task.status}
            </span>
            <span className={`rounded-full px-3 py-1.5 text-xs font-black ${priorityClass(task.priority)}`}>
              {task.priority}
            </span>
            {isOverdue(task) ? (
              <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">
                Overdue
              </span>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <Field icon={<CalendarDays size={14} />} label="Due Date" value={dueLabel(task.dueDate)} />
            <Field icon={<Flag size={14} />} label="Priority" value={task.priority} />
            <Field icon={<Briefcase size={14} />} label="Company" value={task.company} />
            <Field icon={<FileText size={14} />} label="Type" value={task.taskType} />
            <Field icon={<User size={14} />} label="Owner" value={task.owner} />
            <Field icon={<LinkIcon size={14} />} label="Related To" value={task.relatedTo} />
          </div>

          {task.nextStep ? (
            <section className="mt-5 rounded-[22px] border border-orange-100 bg-orange-50 p-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-700">
                <AlertCircle size={15} />
                Next Step
              </div>
              <p className="mt-2 text-sm font-bold leading-relaxed text-orange-900">
                {task.nextStep}
              </p>
            </section>
          ) : null}

          {task.notes ? (
            <section className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                <MessageSquare size={15} />
                Notes
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-relaxed text-slate-700">
                {task.notes}
              </p>
            </section>
          ) : null}

          {task.link ? (
            <a
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#232D4B] px-4 py-3 text-sm font-black text-white transition hover:bg-[#151C33]"
              href={task.link}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={16} />
              Open link
            </a>
          ) : null}

          <section className="mt-6">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              Move status
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {COLUMNS.map((column) => (
                <button
                  key={column.key}
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-black transition ${
                    task.status === column.key
                      ? "bg-[#232D4B] text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                  }`}
                  onClick={() => onMove(task.id, column.key)}
                >
                  {column.title}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-5">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-50 px-4 py-3 text-sm font-black text-red-700 transition hover:bg-red-100"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 size={16} />
            Delete
          </button>
          <button type="button" className="btn-secondary" onClick={() => onEdit(task)}>
            <Pencil size={16} />
            Edit
          </button>
        </div>
      </aside>
    </div>
  );
}

function TaskModal({
  task,
  onClose,
  onSave,
}: {
  task: CompassTask;
  onClose: () => void;
  onSave: (task: CompassTask) => void;
}) {
  const [draft, setDraft] = useState<CompassTask>(task);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_90px_rgba(15,23,42,0.32)]">
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
            className="rounded-full border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid max-h-[70vh] gap-4 overflow-y-auto pr-1">
          <label>
            <span className="label">Title</span>
            <input
              className="input"
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="Prepare questions for McKinsey coffee chat"
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
              <span className="label">Task Type</span>
              <select
                className="input"
                value={draft.taskType}
                onChange={(event) => setDraft({ ...draft, taskType: event.target.value })}
              >
                {TASK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
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
                  setDraft({ ...draft, priority: event.target.value as TaskPriority })
                }
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
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
              <span className="label">Owner / Person</span>
              <input
                className="input"
                value={draft.owner}
                onChange={(event) => setDraft({ ...draft, owner: event.target.value })}
                placeholder="You, recruiter, classmate..."
              />
            </label>

            <label>
              <span className="label">Related To</span>
              <input
                className="input"
                value={draft.relatedTo}
                onChange={(event) => setDraft({ ...draft, relatedTo: event.target.value })}
                placeholder="Event, application, contact..."
              />
            </label>
          </div>

          <label>
            <span className="label">Useful Link</span>
            <input
              className="input"
              value={draft.link}
              onChange={(event) => setDraft({ ...draft, link: event.target.value })}
              placeholder="https://..."
            />
          </label>

          <label>
            <span className="label">Next Step</span>
            <input
              className="input"
              value={draft.nextStep}
              onChange={(event) => setDraft({ ...draft, nextStep: event.target.value })}
              placeholder="Send follow-up, submit application, prep cases..."
            />
          </label>

          <label>
            <span className="label">Notes</span>
            <textarea
              className="input min-h-32 resize-y"
              value={draft.notes}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
              placeholder="Add links, talking points, context, blockers, drafts..."
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
  seedRows: Array<Partial<CompassTask> & Record<string, any>>;
  storageKey: string;
}) {
  const [tasks, setTasks] = useState<CompassTask[]>(() =>
    loadLocal(storageKey, seedRows.map(normalizeTask)),
  );
  const [query, setQuery] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);
  const [editing, setEditing] = useState<CompassTask | null>(null);
  const [selected, setSelected] = useState<CompassTask | null>(null);

  function persist(next: CompassTask[]) {
    setTasks(next);
    saveLocal(storageKey, next);
  }

  function moveTask(id: string, status: TaskStatus) {
    const next = tasks.map((task) =>
      task.id === id ? { ...task, status, updatedAt: new Date().toISOString() } : task,
    );
    persist(next);
    setSelected((current) =>
      current?.id === id ? { ...current, status, updatedAt: new Date().toISOString() } : current,
    );
  }

  function upsertTask(task: CompassTask) {
    const cleaned: CompassTask = {
      ...normalizeTask(task),
      id: task.id || makeId("task"),
      title: task.title.trim() || "Untitled task",
      company: task.company.trim(),
      notes: task.notes || "",
      updatedAt: new Date().toISOString(),
    };

    const exists = tasks.some((item) => item.id === cleaned.id);
    const next = exists
      ? tasks.map((item) => (item.id === cleaned.id ? cleaned : item))
      : [cleaned, ...tasks];

    persist(next);
    setEditing(null);
    setSelected(cleaned);
  }

  function deleteTask(id: string) {
    const ok = confirm("Remove this task?");
    if (!ok) return;
    persist(tasks.filter((task) => task.id !== id));
    setSelected((current) => (current?.id === id ? null : current));
    setEditing((current) => (current?.id === id ? null : current));
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;

    return tasks.filter((task) =>
      [
        task.title,
        task.company,
        task.status,
        task.priority,
        task.notes,
        task.dueDate,
        task.owner,
        task.relatedTo,
        task.taskType,
        task.nextStep,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [tasks, query]);

  const grouped = useMemo(() => {
    return COLUMNS.reduce<Record<TaskStatus, CompassTask[]>>(
      (acc, column) => {
        acc[column.key] = filtered.filter((task) => task.status === column.key);
        return acc;
      },
      {
        "To Do": [],
        "In Progress": [],
        Review: [],
        Done: [],
      },
    );
  }, [filtered]);

  const inProgress = tasks.filter((task) => task.status === "In Progress").length;
  const review = tasks.filter((task) => task.status === "Review").length;
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
              A Jira-style board for recruiting work — drag tasks forward as they move from pending to done.
            </p>
          </div>

          <button
            type="button"
            className="btn"
            onClick={() => {
              setSelected(null);
              setEditing(emptyTask("To Do"));
            }}
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
            In Progress
          </div>
          <div className="mt-2 text-4xl font-black text-blue-700">{inProgress}</div>
        </div>

        <div className="card p-5">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
            Review
          </div>
          <div className="mt-2 text-4xl font-black text-[#E57200]">{review}</div>
        </div>

        <div className="card p-5">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
            Done
          </div>
          <div className="mt-2 text-4xl font-black text-emerald-700">{completed}</div>
          {overdue ? (
            <div className="mt-2 text-xs font-black text-red-700">{overdue} overdue</div>
          ) : null}
        </div>
      </div>

      <div className="card p-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="input !pl-11"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks, companies, owners, notes..."
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
              className={`min-h-[560px] rounded-[24px] border p-3 transition ${
                isOver
                  ? "border-[#E57200] bg-orange-50/70 shadow-medium"
                  : "border-slate-200 bg-white/70"
              }`}
            >
              <div className="mb-3 rounded-[18px] border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${column.accent}`}>
                        {column.icon}
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
                  onClick={() => {
                    setSelected(null);
                    setEditing(emptyTask(column.key));
                  }}
                >
                  + Add to {column.title}
                </button>
              </div>

              <div className="grid gap-3">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onOpen={setSelected}
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
                  <div className="rounded-[18px] border border-dashed border-slate-200 bg-white/70 p-6 text-center">
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

      {selected ? (
        <TaskDetailsOverlay
          task={selected}
          onClose={() => setSelected(null)}
          onEdit={(task) => setEditing(task)}
          onDelete={deleteTask}
          onMove={moveTask}
        />
      ) : null}

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
