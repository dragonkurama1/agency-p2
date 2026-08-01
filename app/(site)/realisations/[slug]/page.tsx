import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Quote } from "lucide-react";
import { getProjects, getProjectBySlug } from "@/data/projects";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { VideoPlayer } from "@/components/marketing/video-player";
import { normalizeImageUrl, isVideoUrl } from "@/lib/parse";
import { WebPageJsonLd } from "@/components/seo/json-ld";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const title = project.meta_title || `${project.title} — Prestigia Agency`;
  const description =
    project.meta_description || project.description || project.objective;
  return {
    title,
    description,
    alternates: { canonical: `/realisations/${slug}` },
    openGraph: {
      title,
      description,
      images: project.cover_image
        ? [{ url: normalizeImageUrl(project.cover_image), width: 1200, height: 630, alt: project.title }]
        : [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: project.cover_image ? [normalizeImageUrl(project.cover_image)] : ["/og-image.png"],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const [project, allProjects] = await Promise.all([
    getProjectBySlug(slug),
    getProjects(),
  ]);
  if (!project) notFound();

  // Projets similaires (même secteur, exclu lui-même, max 3)
  const related = allProjects
    .filter((p) => p.slug !== slug && p.sector === project.sector)
    .slice(0, 3);
  const others = related.length
    ? related
    : allProjects.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <WebPageJsonLd
        title={project.meta_title || project.title}
        description={project.meta_description || project.description || project.objective}
        path={`/realisations/${slug}`}
        breadcrumbs={[
          { name: "Réalisations", href: "/realisations" },
          { name: project.title, href: `/realisations/${slug}` },
        ]}
      />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden">
        {/* Image / Vidéo de couverture */}
        <div className="relative w-full aspect-[21/9] min-h-[320px] max-h-[600px]">
          {project.cover_image ? (
            isVideoUrl(project.cover_image) ? (
              <VideoPlayer src={normalizeImageUrl(project.cover_image)} className="absolute inset-0 w-full h-full" />
            ) : (
              <Image
                src={normalizeImageUrl(project.cover_image)}
                alt={project.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            )
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/20 to-[var(--muted)]" />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/40 to-transparent" />
        </div>
      </div>

      <article className="container-px mx-auto max-w-7xl pb-24 -mt-8">
        {/* ── Breadcrumb ───────────────────────────────────────────────── */}
        <nav aria-label="Fil d'Ariane" className="mb-8">
          <Link
            href="/realisations"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--accent-gold)] transition-colors"
          >
            <ArrowLeft className="size-4" /> Toutes les réalisations
          </Link>
        </nav>

        <div className="grid lg:grid-cols-[1fr_300px] gap-16">
          {/* ── Colonne principale ──────────────────────────────────────── */}
          <div>
            {/* En-tête */}
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)]">
              {project.sector}
            </span>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl leading-tight">
              {project.title}
            </h1>
            {project.description && (
              <p className="mt-6 text-lg text-[var(--muted-foreground)] leading-relaxed max-w-2xl">
                {project.description}
              </p>
            )}

            {/* ── Objectif / Solution / Résultats ─────────────────────── */}
            <div className="mt-12 grid sm:grid-cols-3 gap-6">
              {[
                { label: "Objectif", content: project.objective },
                { label: "Solution", content: project.solution },
                { label: "Résultats", content: project.results },
              ]
                .filter((c) => c.content)
                .map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6"
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-3">
                      {card.label}
                    </p>
                    <p className="text-sm leading-relaxed">{card.content}</p>
                  </div>
                ))}
            </div>

            {/* ── Sections richtext ────────────────────────────────────── */}
            {project.sections.map((section, idx) => (
              <div key={idx} className="mt-16">
                {/* Numéro de section */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl font-serif text-[var(--accent-gold)]/20 font-bold leading-none select-none">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl leading-snug">
                    {section.title}
                  </h2>
                </div>
                <div
                  className="border-l-2 pl-6 ml-8"
                  style={{ borderLeftColor: "var(--border)" }}
                >
                  <p className="text-[var(--muted-foreground)] leading-relaxed whitespace-pre-line">
                    {section.text}
                  </p>

                  {/* Médias de la section */}
                  {section.media && section.media.length > 0 && (
                    <div className={`mt-8 grid gap-4 ${section.media.length === 1 ? "grid-cols-1" : "sm:grid-cols-2"}`}>
                      {section.media.map((url, mIdx) => (
                        <div
                          key={mIdx}
                          className="relative rounded-xl overflow-hidden aspect-[16/9]"
                        >
                          {isVideoUrl(url) ? (
                            <VideoPlayer src={normalizeImageUrl(url)} className="absolute inset-0 w-full h-full" />
                          ) : (
                            <Image
                              src={normalizeImageUrl(url)}
                              alt={`${section.title} — visuel ${mIdx + 1}`}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* ── Galerie photos ────────────────────────────────────────── */}
            {project.gallery.length > 0 && (
              <div className="mt-16">
                <h2 className="font-serif text-2xl mb-8">Galerie</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {project.gallery.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl overflow-hidden group"
                    >
                      {isVideoUrl(url) ? (
                        <VideoPlayer src={normalizeImageUrl(url)} className="absolute inset-0 w-full h-full" />
                      ) : (
                        <Image
                          src={normalizeImageUrl(url)}
                          alt={`${project.title} — photo ${i + 1}`}
                          fill
                          sizes="(max-width: 640px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Témoignage client ─────────────────────────────────────── */}
            {project.testimonial_quote && (
              <div className="mt-16 relative rounded-2xl border border-[var(--accent-gold)]/20 bg-[var(--muted)] p-8 overflow-hidden">
                <Quote className="absolute top-4 right-6 size-16 text-[var(--accent-gold)]/10" />
                <blockquote className="relative font-serif text-xl sm:text-2xl leading-relaxed italic">
                  &ldquo;{project.testimonial_quote}&rdquo;
                </blockquote>
                {project.testimonial_author && (
                  <p className="mt-5 text-sm font-medium text-[var(--accent-gold)]">
                    — {project.testimonial_author}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Sidebar infos ────────────────────────────────────────────── */}
          <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
            {/* Logo client */}
            {project.logo_url && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6 flex items-center justify-center">
                <Image
                  src={normalizeImageUrl(project.logo_url)}
                  alt={`Logo ${project.client_name}`}
                  width={160}
                  height={80}
                  className="h-16 w-auto object-contain"
                />
              </div>
            )}

            {/* Infos */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1">
                  Client
                </p>
                <p className="font-medium">{project.client_name}</p>
              </div>
              <div className="border-t border-[var(--border)]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1">
                  Secteur
                </p>
                <p className="font-medium">{project.sector}</p>
              </div>
              <div className="border-t border-[var(--border)]" />
              {project.services.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-3">
                    Services
                  </p>
                  <ul className="space-y-2">
                    {project.services.map((s) => (
                      <li key={s} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="size-4 text-[var(--accent-gold)] flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* CTA contact */}
            <Link
              href="/contact"
              className="block w-full text-center rounded-2xl bg-[var(--accent-gold)] text-white font-semibold py-4 px-6 transition-all duration-200 hover:bg-[var(--accent-gold-hover)] hover:shadow-[0_0_24px_var(--accent-gold)/40]"
            >
              Un projet similaire ?
            </Link>
          </aside>
        </div>

        {/* ── Projets similaires ─────────────────────────────────────────── */}
        {others.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <h2 className="font-serif text-2xl whitespace-nowrap">
                Autres réalisations
              </h2>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  href={`/realisations/${p.slug}`}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--muted)] overflow-hidden transition-all duration-300 hover:border-[var(--accent-gold)]/40"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {p.cover_image ? (
                      <Image
                        src={normalizeImageUrl(p.cover_image)}
                        alt={p.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/10 to-[var(--border)]" />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-medium text-[var(--accent-gold)]">{p.sector}</p>
                    <h3 className="mt-1 font-serif text-base leading-snug">{p.title}</h3>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">{p.client_name}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--accent-gold)] opacity-0 group-hover:opacity-100 transition-opacity">
                      Voir <ArrowUpRight className="size-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <CtaBanner />
    </>
  );
}
