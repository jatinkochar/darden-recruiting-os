import { cn } from "@/lib/utils";
export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("pill", className)}>{children}</span>;
}
