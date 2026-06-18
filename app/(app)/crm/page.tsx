import contacts from "@/data/contacts.json";
import { CrudClient } from "@/components/crud/CrudClient";

const fields = [
  { key: "name", label: "Name" },
  { key: "company", label: "Company" },
  { key: "office", label: "Office" },
  { key: "role", label: "Role" },
  { key: "email", label: "Email" },
  { key: "linkedin", label: "LinkedIn", type: "url" as const },
  { key: "lastTouch", label: "Last Touch", type: "date" as const },
  { key: "nextFollowUp", label: "Next Follow-up", type: "date" as const },
  { key: "status", label: "Status" },
  { key: "notes", label: "Notes", type: "textarea" as const }
];

export default function CrmPage() {
  return <CrudClient title="Networking CRM" storageKey="darden-os-crm-sprint-1-3" seedRows={contacts} fields={fields} />;
}
