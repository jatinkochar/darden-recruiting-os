import tasks from "@/data/tasks.json";
import { CrudClient } from "@/components/crud/CrudClient";
const fields = [
  { key: "title", label: "Title" }, { key: "company", label: "Company" }, { key: "dueDate", label: "Due Date", type: "date" as const }, { key: "status", label: "Status" }, { key: "priority", label: "Priority" }, { key: "notes", label: "Notes", type: "textarea" as const }
];
export default function TasksPage() { return <CrudClient title="Tasks" storageKey="darden-os-tasks-v1-1" seedRows={tasks} fields={fields} />; }
