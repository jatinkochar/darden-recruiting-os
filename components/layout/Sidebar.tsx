import Link from "next/link";
import { CalendarDays, CheckSquare, Home, Settings, Users, Briefcase } from "lucide-react";
const items = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/crm", label: "Networking CRM", icon: Users },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings }
];
export function Sidebar() {
  return <aside className="card sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 p-4 lg:block">
    <div className="mb-6 rounded-2xl bg-stone-900 p-4 text-white"><div className="text-xs font-black uppercase tracking-widest text-stone-300">Darden</div><div className="mt-1 text-2xl font-black tracking-tight">Recruiting OS</div></div>
    <nav className="grid gap-2">{items.map((item) => { const Icon = item.icon; return <Link className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-stone-700 hover:bg-stone-100" href={item.href} key={item.href}><Icon size={18} />{item.label}</Link>; })}</nav>
  </aside>;
}
