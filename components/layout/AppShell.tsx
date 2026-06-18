import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string;
}) {
  return (
    <main className="page-shell min-h-screen">
      <div className="mx-auto flex max-w-[1480px] gap-5 p-3 md:p-5 lg:p-6">
        <Sidebar userEmail={userEmail} />
        <section className="min-w-0 flex-1 pb-10 lg:pl-1">{children}</section>
      </div>
    </main>
  );
}
