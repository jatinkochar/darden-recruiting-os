export function StatCard({ label, value }: { label: string; value: string | number }) {
  return <div className="card p-5"><div className="text-xs font-black uppercase tracking-wider text-stone-500">{label}</div><div className="mt-2 text-4xl font-black tracking-tight text-stone-900">{value}</div></div>;
}
