export default function SettingsPage({
  searchParams
}: {
  searchParams?: { google?: string };
}) {
  const googleStatus = searchParams?.google;

  return (
    <div className="space-y-5">
      <div className="card p-6">
        <h1 className="text-4xl font-black tracking-tight">Settings</h1>
        <p className="mt-2 text-stone-600">
          Connect Google to import Gmail recruiting emails and Google Calendar events.
        </p>
      </div>

      {googleStatus ? (
        <div className="card p-4 text-sm font-bold">
          Google status: <span className="text-clay">{googleStatus}</span>
        </div>
      ) : null}

      <div className="card p-6">
        <h2 className="text-xl font-black">Google Gmail + Calendar</h2>
        <p className="mt-2 max-w-2xl text-stone-600">
          This connects Gmail read-only access and Calendar access. Gmail is used to find recruiting emails.
          Calendar is used to import relevant MBA/recruiting events.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <a className="btn" href="/api/auth/google/start">
            Connect Google
          </a>

          <form action="/api/sync/google" method="post">
            <button className="btn-secondary" type="submit">
              Sync Google Now
            </button>
          </form>
        </div>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          After connecting Google, click Sync Google Now. Later we can automate this with Vercel Cron.
        </div>
      </div>
    </div>
  );
}
