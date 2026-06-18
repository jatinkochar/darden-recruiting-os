import Link from "next/link";
import {
  Briefcase,
  Calendar,
  CalendarDays,
  CheckSquare,
  Compass,
  Home,
  LogOut,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

const items = [
  { href: "/", label: "Today", icon: Home },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/crm", label: "People", icon: Users },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

function initials(email?: string) {
  if (!email) return "C";
  return email.slice(0, 1).toUpperCase();
}

export function Sidebar({ userEmail }: { userEmail?: string }) {
  return (
    <aside className="sticky top-5 hidden h-[calc(100vh-2.5rem)] w-72 shrink-0 overflow-hidden rounded-[28px] bg-[#232D4B] p-4 text-white shadow-[0_24px_70px_rgba(35,45,75,0.28)] lg:flex lg:flex-col">
      <div className="rounded-[22px] border border-white/10 bg-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E57200] text-white shadow-lg shadow-orange-950/20">
            <Compass size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/50">
              MBA Recruiting
            </div>
            <div className="mt-0.5 text-2xl font-black tracking-tight text-white">
              Compass
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white/[0.07] p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 shrink-0 text-[#E57200]" size={15} />
            <p className="text-xs font-semibold leading-relaxed text-white/70">
              Your MBA recruiting companion.
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-5 grid gap-1.5">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white/68 transition hover:bg-white/[0.08] hover:text-white"
              href={item.href}
              key={item.href}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-white/70 transition group-hover:bg-[#E57200] group-hover:text-white">
                <Icon size={17} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        {userEmail ? (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.07] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-black text-[#232D4B]">
                {initials(userEmail)}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                  Signed in
                </div>
                <div className="truncate text-sm font-bold text-white/85">
                  {userEmail}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <form action="/api/auth/logout" method="post">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black text-white/72 transition hover:bg-white hover:text-[#232D4B]"
            type="submit"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
