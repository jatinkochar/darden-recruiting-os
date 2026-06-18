import { GoogleSyncPanel } from "@/components/settings/GoogleSyncPanel";

export default function SettingsPage({
  searchParams
}: {
  searchParams?: { google?: string };
}) {
  return (
    <div className="space-y-5">
      <div className="card p-6">
        <h1 className="text-4xl font-black tracking-tight">Settings</h1>
        <p className="mt-2 text-stone-600">
          Connect Google to import Gmail recruiting emails and Google Calendar events.
        </p>
      </div>

      {searchParams?.google ? (
        <div className="card p-4 text-sm font-bold">
          Google status: <span className="text-clay">{searchParams.google}</span>
        </div>
      ) : null}

      <GoogleSyncPanel />
    </div>
  );
}
