import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // Le middleware filtre déjà les requêtes non authentifiées ; cette vérification
  // server-side est une seconde ligne de défense (ex. cache, navigation client).
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
