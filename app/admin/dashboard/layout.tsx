import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import SessionProviderWrapper from "@/components/admin/SessionProviderWrapper";
import { Toaster } from "react-hot-toast";

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
      <AdminLayoutWrapper>
        {children}
      </AdminLayoutWrapper>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '3px solid hsl(var(--border))',
            borderRadius: '0',
            boxShadow: '4px 4px 0px hsl(var(--border))',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            fontSize: '0.875rem'
          }
        }}
      />
    </SessionProviderWrapper>
  );
}
