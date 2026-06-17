import contacts from "@/data/contacts.json";

export default function CrmPage() {
  return (
    <div className="space-y-5">
      <div className="card p-6">
        <h1 className="text-4xl font-black tracking-tight">Networking CRM</h1>
        <p className="mt-2 text-stone-600">Track recruiters, alumni, coffee chats, warm leads, and follow-ups.</p>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-100 text-xs uppercase tracking-wider text-stone-500">
            <tr><th className="p-4">Name</th><th>Company</th><th>Role</th><th>Follow-up</th><th>Status</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr className="border-t border-stone-200" key={contact.id}>
                <td className="p-4 font-bold">{contact.name}</td>
                <td>{contact.company}</td>
                <td>{contact.role || "—"}</td>
                <td>{contact.nextFollowUp || "—"}</td>
                <td>{contact.status}</td>
                <td className="max-w-md text-sm text-stone-600">{contact.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
