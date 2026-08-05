import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getIcon } from "@/lib/icons";
import type { Service } from "@/lib/seed-data";

export function ServicesGrid({ services, compact = false }: { services: Service[]; compact?: boolean }) {
  const items = compact ? services.slice(0, 6) : services;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((service) => {
        const Icon = getIcon(service.icon);
        return (
          <Link
            key={service.slug}
            href={`/services/${service.slug}`}
            className="group relative rounded-2xl p-6 transition-all duration-400 glass-card overflow-hidden"
          >
            {/* Halo de fond au hover */}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 50%, rgb(var(--accent-gold-rgb) / 0.12) 0%, transparent 65%)",
              }}
            />

            {/* Icône avec halo */}
            <div className="relative inline-flex items-center justify-center size-12 rounded-xl mb-5"
              style={{
                background: "rgb(var(--accent-gold-rgb) / 0.12)",
                border: "1px solid rgb(var(--accent-gold-rgb) / 0.22)",
              }}
            >
              <Icon
                className="size-6 text-[var(--accent-gold)] icon-halo transition-transform duration-300 group-hover:scale-110"
              />
            </div>

            <h3 className="font-serif text-xl leading-snug text-white mb-2 group-hover:text-glow transition-all duration-300">
              {service.title}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              {service.short_description}
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-normal text-[var(--accent-gold-text)] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
              En savoir plus <ArrowUpRight className="size-3.5" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
