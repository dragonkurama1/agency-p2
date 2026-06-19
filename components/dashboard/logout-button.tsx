import { LogOut } from "lucide-react";
import { logout } from "@/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-[var(--accent-gold)]"
      >
        <LogOut className="size-4" />
        Déconnexion
      </button>
    </form>
  );
}
