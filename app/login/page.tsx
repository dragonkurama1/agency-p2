import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Connexion — Dashboard",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-8">
        <h1 className="font-serif text-2xl">Prestigia Agency</h1>
        <p className="mt-1 text-sm text-muted-foreground">Connexion au dashboard admin</p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
