export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <div className="card p-6">
        <h1 className="text-4xl font-black tracking-tight">Settings</h1>
        <p className="mt-2 text-stone-600">
          Future home for Gmail, Outlook, Google Calendar, Supabase, and notification settings.
        </p>
      </div>
      <div className="card p-6">
        <h2 className="text-xl font-black">Next integrations</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-stone-600">
          <li>Google OAuth and Gmail API event extraction</li>
          <li>Outlook event extraction</li>
          <li>Supabase database persistence</li>
          <li>Google Calendar sync</li>
        </ul>
      </div>
    </div>
  );
}
