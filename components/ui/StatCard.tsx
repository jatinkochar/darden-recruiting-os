import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  tone?: "navy" | "orange" | "blue" | "green" | "neutral";
};

const toneMap = {
  navy: "bg-[#232D4B] text-white border-[#232D4B]",
  orange: "bg-[#FFF3E7] text-[#B85C00] border-[#FFE0BD]",
  blue: "bg-[#E8F3F8] text-[#005587] border-[#CFE7F1]",
  green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  neutral: "bg-white text-[#172033] border-stone-200",
};

export function StatCard({ label, value, helper, icon, tone = "neutral" }: StatCardProps) {
  const isNavy = tone === "navy";

  return (
    <div className={`rounded-[24px] border p-5 shadow-soft ${toneMap[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={`text-[11px] font-black uppercase tracking-[0.18em] ${isNavy ? "text-white/55" : "text-stone-500"}`}>
            {label}
          </div>
          <div className="mt-3 text-4xl font-black tracking-tight">{value}</div>
        </div>
        {icon ? <div className={`rounded-2xl p-2 ${isNavy ? "bg-white/10 text-white" : "bg-white text-[#232D4B]"}`}>{icon}</div> : null}
      </div>
      {helper ? <div className={`mt-3 text-sm font-bold ${isNavy ? "text-white/65" : "text-stone-500"}`}>{helper}</div> : null}
    </div>
  );
}
