import tasks from "@/data/tasks.json";
import { Pill } from "@/components/ui/Pill";
import { priorityClass } from "@/lib/utils";

const columns = ["Backlog", "This Week", "Today", "Done"] as const;

export default function TasksPage() {
  return (
    <div className="space-y-5">
      <div className="card p-6">
        <h1 className="text-4xl font-black tracking-tight">Tasks</h1>
        <p className="mt-2 text-stone-600">Kanban view for recruiting action items.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        {columns.map((column) => (
          <section className="card min-h-80 p-4" key={column}>
            <h2 className="mb-4 font-black">{column}</h2>
            <div className="space-y-3">
              {tasks.filter((task) => task.status === column).map((task) => (
                <article className="rounded-2xl border border-stone-200 bg-white/70 p-4" key={task.id}>
                  <div className="font-black">{task.title}</div>
                  <div className="mt-1 text-sm text-stone-500">{task.company} · due {task.dueDate || "TBD"}</div>
                  <div className="mt-3"><Pill className={priorityClass(task.priority)}>{task.priority}</Pill></div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
