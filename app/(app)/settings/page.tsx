export default function SettingsPage() {
  return <div className="space-y-5"><div className="card p-6"><h1 className="text-4xl font-black tracking-tight">Settings</h1><p className="mt-2 text-stone-600">Configure Supabase and Gmail sync via Vercel environment variables.</p></div><div className="card p-6"><h2 className="text-xl font-black">Sprint 1–3 included</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-stone-600"><li>Supabase-ready persistent events CRUD</li><li>Calendar agenda + month views</li><li>Gmail sync API scaffolding + parser</li></ul></div></div>;
}
