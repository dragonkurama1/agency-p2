"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 48);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-black/75 backdrop-blur-xl border-b border-[rgba(124,58,237,0.2)] shadow-[0_4px_40px_rgba(0,0,0,0.5)]"
          : "bg-transparent border-b border-transparent"
      )}
    >
      {/* Container aligné sur le même gabarit que le hero : 1600px / 70px */}
      <div
        className="mx-auto flex w-full items-center justify-between"
        style={{
          maxWidth: "1600px",
          paddingLeft: "70px",
          paddingRight: "70px",
          height: "80px",
        }}
      >
        {/* Logo — extrême gauche */}
        <Link href="/" aria-label="Prestigia Agency — Accueil" className="flex-shrink-0">
          <Image
            src="/logo-prestigia.png"
            alt="Prestigia Agency"
            width={125}
            height={56}
            priority
            className="h-11 w-auto"
          />
        </Link>

        {/* Nav desktop — côté droit */}
        <nav
          className="hidden items-center lg:flex"
          style={{ gap: "48px" }}
          aria-label="Navigation principale"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative text-sm font-medium tracking-wide transition-colors duration-200",
                "after:absolute after:-bottom-0.5 after:left-0 after:h-px",
                "after:bg-[#7C3AED] after:transition-all after:duration-300",
                pathname === link.href
                  ? "text-[#7C3AED] after:w-full"
                  : "text-white/70 hover:text-white after:w-0 hover:after:w-full"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Burger mobile */}
        <button
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="lg:hidden p-1 text-white/80 hover:text-white transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="border-t border-[rgba(124,58,237,0.2)] bg-black/90 backdrop-blur-xl px-6 py-6 lg:hidden">
          <nav className="flex flex-col gap-4" aria-label="Navigation mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "text-base tracking-wide transition-colors py-1",
                  pathname === link.href
                    ? "text-[#7C3AED] font-semibold"
                    : "text-white/70 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/devis"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-[#7C3AED] px-6 py-3 text-sm font-semibold text-white tracking-wide"
            >
              Demander un devis
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
