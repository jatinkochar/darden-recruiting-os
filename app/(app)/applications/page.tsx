import applications from "@/data/applications.json";
import { CrudClient } from "@/components/crud/CrudClient";
const fields = [
  { key: "company", label: "Company" }, { key: "role", label: "Role" }, { key: "status", label: "Status" }, { key: "deadline", label: "Deadline", type: "date" as const }, { key: "priority", label: "Priority" }, { key: "link", label: "Link", type: "url" as const }, { key: "notes", label: "Notes", type: "textarea" as const }
];
export default function ApplicationsPage() { return <CrudClient title="Applications" storageKey="darden-os-applications-v1-1" seedRows={applications} fields={fields} />; }
