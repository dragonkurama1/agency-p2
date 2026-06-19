import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getIcon } from "@/lib/icons";
import type { Service } from "@/lib/seed-data";

export function ServicesGrid({ services, compact = false }: { services: Service[]; compact?: boolean }) {
  const items = compact ? services.slice(0, 6) : services;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((service) => {
        const Icon = getIcon(service.icon);
        return (
          <Link
            key={service.slug}
            href={`/services/${service.slug}`}
            className="group relative rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6 transition-colors hover:border-[var(--accent-gold)]"
          >
            <Icon className="size-8 text-[var(--accent-gold)]" />
            <h3 className="mt-5 font-serif text-xl leading-snug">{service.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{service.short_description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-[var(--accent-gold)] opacity-0 transition-opacity group-hover:opacity-100">
              En savoir plus <ArrowUpRight className="size-4" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
