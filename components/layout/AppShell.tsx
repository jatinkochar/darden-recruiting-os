import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex max-w-7xl gap-6 p-4 md:p-6">
      <Sidebar />
      <section className="min-w-0 flex-1">{children}</section>
    </main>
  );
}
