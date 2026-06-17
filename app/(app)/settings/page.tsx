export default function SettingsPage() {
  return <div className="space-y-5"><div className="card p-6"><h1 className="text-4xl font-black tracking-tight">Settings</h1><p className="mt-2 text-stone-600">Next: Supabase database, Google OAuth, Gmail sync, Outlook sync, and calendar sync.</p></div><div className="card p-6"><h2 className="text-xl font-black">Current version</h2><p className="mt-2 text-stone-600">V1.1 uses browser localStorage so you can add/edit/delete immediately. Data persists on the same browser. V1.2 will move this to Supabase so it works across devices.</p></div></div>;
}
