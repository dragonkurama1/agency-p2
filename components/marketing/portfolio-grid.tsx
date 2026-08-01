"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Building2, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeImageUrl } from "@/lib/parse";
import type { Project } from "@/data/projects";

const SECTOR_ICONS: Record<string, string> = {
  "Immobilier": "🏢",
  "Sport & loisirs": "⚽",
  "BTP & matériaux": "🏗️",
  "Formation sportive": "🎯",
  "Restauration": "🍽️",
  "Santé": "⚕️",
  "Mode & Luxe": "✨",
  "Tech & SaaS": "💻",
  "E-commerce": "🛒",
  "Éducation": "📚",
};

export function PortfolioGrid({
  projects,
  sectors,
}: {
  projects: Project[];
  sectors: string[];
}) {
  const [active, setActive] = useState<string>("Tous");
  const filtered =
    active === "Tous" ? projects : projects.filter((p) => p.sector === active);

  return (
    <div>
      {/* ── Filtres secteur ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-12">
        {["Tous", ...sectors].map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
              active === s
                ? "border-[var(--accent-gold)] bg-[var(--accent-gold)] text-white shadow-[0_0_16px_var(--accent-gold)/30]"
                : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent-gold)]/60 hover:text-[var(--foreground)]"
            )}
          >
            {s !== "Tous" && (
              <span className="text-xs">{SECTOR_ICONS[s] ?? "◆"}</span>
            )}
            {s}
          </button>
        ))}
      </div>

      {/* ── Grille projets ──────────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((project) => (
          <Link
            key={project.slug}
            href={`/realisations/${project.slug}`}
            className="group relative rounded-2xl border border-[var(--border)] bg-[var(--muted)] overflow-hidden
                       transition-all duration-300 hover:border-[var(--accent-gold)]/40
                       hover:shadow-[0_0_32px_rgba(124,58,237,0.12)] flex flex-col"
          >
            {/* Image */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--border)]">
              {project.cover_image ? (
                <Image
                  src={normalizeImageUrl(project.cover_image)}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/10 to-[var(--border)]" />
              )}

              {/* Badge secteur */}
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-[11px] font-medium text-white/90">
                  {SECTOR_ICONS[project.sector] ?? "◆"} {project.sector}
                </span>
              </div>

              {/* Featured badge */}
              {project.featured && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-gold)] px-3 py-1 text-[11px] font-semibold text-white">
                    ✦ Vedette
                  </span>
                </div>
              )}
            </div>

            {/* Contenu */}
            <div className="p-6 flex flex-col flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold-text)]">
                {project.category}
              </p>
              <h3 className="mt-2 font-serif text-xl leading-snug group-hover:text-[var(--accent-gold)] transition-colors">
                {project.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {project.client_name}
              </p>

              {/* Services pills */}
              {project.services.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.services.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[11px] text-[var(--muted-foreground)]"
                    >
                      {s}
                    </span>
                  ))}
                  {project.services.length > 3 && (
                    <span className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[11px] text-[var(--muted-foreground)]">
                      +{project.services.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-auto pt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--accent-gold)] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Voir le case study <ArrowUpRight className="size-4" />
                </span>
              </div>
            </div>

            {/* Bord lumineux hover */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, transparent 60%)",
              }}
            />
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-[var(--muted-foreground)]">
          <Briefcase className="size-10 mx-auto mb-4 opacity-30" />
          <p>Aucune réalisation dans ce secteur pour le moment.</p>
        </div>
      )}
    </div>
  );
}
