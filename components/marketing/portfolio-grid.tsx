"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/projects";

export function PortfolioGrid({ projects, categories }: { projects: Project[]; categories: string[] }) {
  const [active, setActive] = useState<string>("Tous");
  const filtered = active === "Tous" ? projects : projects.filter((p) => p.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-10">
        {["Tous", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              active === cat
                ? "border-[var(--accent-gold)] bg-[var(--accent-gold)] text-black"
                : "border-[var(--border)] text-muted-foreground hover:border-[var(--accent-gold)]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((project) => (
          <Link
            key={project.slug}
            href={`/realisations/${project.slug}`}
            className="group rounded-2xl border border-[var(--border)] bg-[var(--muted)] overflow-hidden"
          >
            <div className="aspect-[4/3] bg-[linear-gradient(135deg,var(--border),var(--muted))]" />
            <div className="p-6">
              <p className="text-xs uppercase tracking-wide text-[var(--accent-gold)]">{project.category}</p>
              <h3 className="mt-2 font-serif text-lg leading-snug">{project.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{project.client_name}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm text-[var(--accent-gold)] opacity-0 transition-opacity group-hover:opacity-100">
                Voir le projet <ArrowUpRight className="size-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-muted-foreground text-sm">Aucune réalisation dans cette catégorie pour le moment.</p>
      )}
    </div>
  );
}
