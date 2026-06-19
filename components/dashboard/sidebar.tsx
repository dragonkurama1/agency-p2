import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { entities, entityKeys } from "@/lib/entities";
import { LogoutButton } from "@/components/dashboard/logout-button";

export function DashboardSidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--muted)]">
      <div className="px-6 py-6">
        <Link href="/dashboard" className="font-serif text-lg">
          Prestigia <span className="text-[var(--accent-gold)]">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-[var(--background)] hover:text-[var(--foreground)]"
        >
          <LayoutGrid className="size-4" />
          Vue d&apos;ensemble
        </Link>
        {entityKeys.map((key) => (
          <Link
            key={key}
            href={`/dashboard/${key}`}
            className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-[var(--background)] hover:text-[var(--foreground)]"
          >
            {entities[key].label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-[var(--border)] px-3 py-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
