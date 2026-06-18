import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children, userEmail }: { children: React.ReactNode; userEmail?: string }) {
  return (
    <main className="mx-auto flex max-w-7xl gap-6 p-4 md:p-6">
      <Sidebar userEmail={userEmail} />
      <section className="min-w-0 flex-1">{children}</section>
    </main>
  );
}
