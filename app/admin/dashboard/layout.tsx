import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import SessionProviderWrapper from "@/components/admin/SessionProviderWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <SessionProviderWrapper session={session}>
      <div className="flex min-h-dvh bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">{children}</div>
        </main>
      </div>
    </SessionProviderWrapper>
  );
}
