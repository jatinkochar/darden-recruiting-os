import Link from "next/link";
import { CalendarDays, CheckSquare, Home, Settings, Users, Briefcase, Calendar } from "lucide-react";

const items = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/crm", label: "Networking CRM", icon: Users },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar({ userEmail }: { userEmail?: string }) {
  return (
    <aside className="card sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 p-4 lg:block">
      <div className="mb-6 rounded-2xl bg-stone-900 p-4 text-white">
        <div className="text-xs font-black uppercase tracking-widest text-stone-300">Darden</div>
        <div className="mt-1 text-2xl font-black tracking-tight">Recruiting OS</div>
      </div>

      {userEmail ? (
        <div className="mb-4 rounded-2xl border border-stone-200 bg-white/70 p-3 text-xs font-bold text-stone-600">
          Signed in as<br />
          <span className="text-stone-900">{userEmail}</span>
        </div>
      ) : null}

      <nav className="grid gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-100" href={item.href} key={item.href}>
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action="/api/auth/logout" method="post" className="mt-6">
        <button className="btn-secondary w-full" type="submit">Sign out</button>
      </form>
    </aside>
  );
}
