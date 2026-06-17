import applications from "@/data/applications.json";
import { Pill } from "@/components/ui/Pill";
import { priorityClass } from "@/lib/utils";

export default function ApplicationsPage() {
  return (
    <div className="space-y-5">
      <div className="card p-6">
        <h1 className="text-4xl font-black tracking-tight">Applications</h1>
        <p className="mt-2 text-stone-600">Track consulting and PM recruiting pipelines.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {applications.map((app) => (
          <article className="card p-5" key={app.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">{app.company}</h2>
                <p className="mt-1 text-sm text-stone-500">{app.role}</p>
              </div>
              <Pill className={priorityClass(app.priority)}>{app.priority}</Pill>
            </div>
            <div className="mt-4 text-sm font-bold text-stone-700">{app.status}</div>
            <p className="mt-3 text-sm leading-6 text-stone-600">{app.notes}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
