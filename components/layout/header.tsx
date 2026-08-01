"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
      <div className="container-px mx-auto flex h-20 max-w-7xl items-center justify-between">
        <Link href="/" aria-label="Prestigia Agency — Accueil">
          <Image
            src="/logo-prestigia.png"
            alt="Prestigia Agency — Agence Marketing Digital Casablanca"
            width={125}
            height={56}
            priority
            className="h-12 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm tracking-wide text-[var(--muted-foreground)] transition-colors hover:text-[var(--accent-gold)]",
                pathname === link.href && "text-[var(--accent-gold)]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button asChild size="sm">
            <Link href="/devis">Demander un devis</Link>
          </Button>
        </div>

        <button aria-label="Menu" className="lg:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] px-6 py-6 lg:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-base text-[var(--foreground)]">
                {link.label}
              </Link>
            ))}
            <Button asChild className="w-full">
              <Link href="/devis" onClick={() => setOpen(false)}>Demander un devis</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
