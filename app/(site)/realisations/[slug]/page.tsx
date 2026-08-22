import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Film,
  LineChart,
  Quote,
  Target,
  Users,
  Video,
} from "lucide-react";
import { getProjects, getProjectBySlug } from "@/data/projects";
import type { Project, ProjectCatalogue } from "@/data/projects";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { VideoPlayer } from "@/components/marketing/video-player";
import { normalizeImageUrl, isVideoUrl, shouldBypassImageOptimization } from "@/lib/parse";
import { WebPageJsonLd } from "@/components/seo/json-ld";
import {
  TWITTER_SITE_HANDLE,
  absoluteSeoTitle,
  cleanMetaTitle,
  formatHeading,
  formatMetaDescription,
  seoAlternates,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

type Props = { params: Promise<{ slug: string }> };

const PROF_AMOUZ_CAPTIONS = "/uploads/projects/prof-amouz/effects.fr.vtt";

function getVideoCaptionSrc(project: Project, url: string) {
  const normalized = normalizeImageUrl(url);
  if (
    project.slug === "prof-amouz-catalogue-etude-projet" &&
    normalized.endsWith("/uploads/projects/prof-amouz/effects.mp4")
  ) {
    return PROF_AMOUZ_CAPTIONS;
  }

  return undefined;
}

function ProjectCatalogueFrame({
  catalogue,
  project,
}: {
  catalogue: ProjectCatalogue;
  project: Project;
}) {
  const isEducationProject = [project.category, project.sector]
    .filter(Boolean)
    .some((value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes("education"));
  const pillars = [
    { label: isEducationProject ? "Vision pédagogique" : "Vision du projet", text: catalogue.vision, icon: Target },
    { label: isEducationProject ? "Besoin des étudiants" : "Public cible", text: catalogue.audience, icon: Users },
  ].filter((item) => item.text);
  const metricIcons = [LineChart, Eye, Film, ClipboardCheck];
  const serviceIcons = [Camera, Video, BookOpen];
  const mediaProofs = project.gallery
    .filter(Boolean)
    .slice(0, 3)
    .map((url, index) => ({
      url,
      label: ["Tournage", "Capsule", "Suivi"][index] ?? `Preuve ${index + 1}`,
    }));
  const hasMedia = Boolean(project.video_url) || mediaProofs.length > 0;

  return (
    <section
      aria-label={`Cadre catalogue ${project.title}`}
      className="relative mt-12 overflow-hidden rounded-[2rem] border border-[var(--accent-gold)]/25 bg-black/[0.42] p-4 backdrop-blur-xl sm:p-6 lg:p-8"
      style={{ boxShadow: "0 0 80px rgb(var(--accent-gold-rgb) / 0.14)" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(circle at 16% 20%, rgb(var(--accent-gold-rgb) / 0.28), transparent 30%), radial-gradient(circle at 88% 18%, rgba(56, 189, 248, 0.14), transparent 28%), linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "auto, auto, 48px 48px, 48px 48px",
        }}
      />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
        <div className="rounded-2xl border border-white/[0.1] bg-[#05040d]/70 p-5 sm:p-7">
          <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent-gold-text)]">
            {catalogue.eyebrow}
          </p>
          <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-none text-white sm:text-5xl">
            {catalogue.title}
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
            {catalogue.summary}
          </p>

          {pillars.length > 0 && (
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;

                return (
                  <div key={pillar.label} className="border-l border-[var(--accent-gold)]/50 bg-white/[0.035] p-4">
                    <div className="mb-3 flex items-center gap-2 text-[var(--accent-gold-text)]">
                      <Icon aria-hidden="true" className="size-4" />
                      <p className="text-xs uppercase tracking-[0.18em]">{pillar.label}</p>
                    </div>
                    <p className="text-sm leading-6 text-white/70">{pillar.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {catalogue.metrics.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {catalogue.metrics.map((metric, index) => {
              const Icon = metricIcons[index % metricIcons.length];

              return (
                <div key={metric.label} className="group relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#05040d]/74 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/46">{metric.label}</p>
                      <p className="mt-2 font-serif text-4xl leading-none text-white">{metric.value}</p>
                    </div>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/10 text-[var(--accent-gold-text)]">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                  </div>
                  {metric.detail && <p className="mt-3 text-sm leading-6 text-white/58">{metric.detail}</p>}
                  <span className="absolute inset-x-0 bottom-0 h-px bg-[var(--accent-gold)]/70 opacity-60 transition-opacity group-hover:opacity-100" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {hasMedia && (
        <div className="relative mt-6 rounded-2xl border border-white/[0.1] bg-[#05040d]/70 p-4 sm:p-5 lg:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[var(--accent-gold-text)]">Preuves de réalisation</p>
              <h3 className="mt-2 font-serif text-2xl leading-none text-white sm:text-3xl">Vidéo, images et rendu final</h3>
            </div>
            <span className="rounded-full border border-white/[0.12] px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/48">
              Modifiable admin
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(240px,360px)_minmax(0,1fr)] lg:items-start">
            {project.video_url ? (
              <div>
                <div className="flex justify-center lg:justify-start">
                  <VideoPlayer
                    src={normalizeImageUrl(project.video_url)}
                    captionSrc={getVideoCaptionSrc(project, project.video_url)}
                    className="aspect-[9/16] w-full max-w-[320px] rounded-[1.25rem] border border-[var(--accent-gold)]/25 shadow-[0_0_44px_rgb(var(--accent-gold-rgb)/0.12)]"
                    videoClassName="object-cover"
                  />
                </div>
                <div className="mx-auto mt-3 flex max-w-[320px] items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-white/42 lg:mx-0">
                  <span>Format Reel</span>
                  <span>9:16</span>
                </div>
                <p className="mx-auto mt-3 max-w-[320px] text-sm leading-6 text-white/58 lg:mx-0">
                  Vidéo verticale liée au projet, affichée dans un cadre type téléphone pour respecter le format Reel.
                </p>
              </div>
            ) : (
              mediaProofs[0] && (
                <div className="relative aspect-video overflow-hidden rounded-xl border border-[var(--accent-gold)]/20 bg-black">
                  <Image
                    src={normalizeImageUrl(mediaProofs[0].url)}
                    alt={`${project.title} — ${mediaProofs[0].label}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    unoptimized={shouldBypassImageOptimization(mediaProofs[0].url)}
                    className="object-cover"
                  />
                </div>
              )
            )}

            {mediaProofs.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {mediaProofs.map((item) => (
                  <div key={item.url} className="group grid grid-cols-[96px_1fr] gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] p-2 sm:grid-cols-1 lg:grid-cols-[112px_1fr]">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-black">
                      {isVideoUrl(item.url) ? (
                        <VideoPlayer
                          src={normalizeImageUrl(item.url)}
                          captionSrc={getVideoCaptionSrc(project, item.url)}
                          className="absolute inset-0 rounded-lg"
                        />
                      ) : (
                        <Image
                          src={normalizeImageUrl(item.url)}
                          alt={`${project.title} — ${item.label}`}
                          fill
                          sizes="160px"
                          unoptimized={shouldBypassImageOptimization(item.url)}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col justify-center">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--accent-gold-text)]">{item.label}</p>
                      <p className="mt-1 text-sm leading-5 text-white/62">
                        Média relié au projet et remplaçable depuis le dashboard.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {catalogue.workflow.length > 0 && (
          <div className="rounded-2xl border border-white/[0.1] bg-[#05040d]/70 p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 className="font-serif text-2xl leading-none text-white">Gestion complète</h3>
              <span className="text-xs uppercase tracking-[0.24em] text-white/38">Suivi projet</span>
            </div>
            <div className="space-y-4">
              {catalogue.workflow.map((step, index) => (
                <div key={step.title} className="grid grid-cols-[auto_1fr] gap-4">
                  <span className="flex size-9 items-center justify-center rounded-lg border border-[var(--accent-gold)]/25 bg-[var(--accent-gold)]/10 font-serif text-lg text-[var(--accent-gold-text)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="border-b border-white/[0.08] pb-4">
                    <p className="font-medium text-white">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/62">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {catalogue.examples.length > 0 && (
          <div className="rounded-2xl border border-white/[0.1] bg-[#05040d]/70 p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 className="font-serif text-2xl leading-none text-white">Exemples de travaux</h3>
              <span className="text-xs uppercase tracking-[0.24em] text-white/38">Photo / vidéo</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {catalogue.examples.map((example, index) => {
                const Icon = serviceIcons[index % serviceIcons.length];

                return (
                  <div key={example.title} className="min-h-56 rounded-xl border border-white/[0.09] bg-white/[0.035] p-4">
                    <Icon aria-hidden="true" className="size-5 text-[var(--accent-gold-text)]" />
                    <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-[var(--accent-gold-text)]">
                      {example.format}
                    </p>
                    <p className="mt-2 font-serif text-2xl leading-none text-white">{example.title}</p>
                    <p className="mt-3 text-sm leading-6 text-white/62">{example.description}</p>
                    {example.proof && <p className="mt-4 text-xs leading-5 text-white/42">{example.proof}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {catalogue.quality.length > 0 && (
        <div className="relative mt-6 rounded-2xl border border-white/[0.1] bg-[#05040d]/70 p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[240px_1fr] lg:items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[var(--accent-gold-text)]">Qualité vidéo</p>
              <h3 className="mt-3 font-serif text-3xl leading-none text-white">Critères de validation</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {catalogue.quality.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-6 text-white/68">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--accent-gold-text)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const title = cleanMetaTitle(project.meta_title || project.title);
  const description = formatMetaDescription(
    project.meta_description || project.description || project.objective,
  );
  return {
    title: absoluteSeoTitle(title),
    description,
    alternates: seoAlternates(`/realisations/${slug}`),
    openGraph: {
      title,
      description,
      url: `/realisations/${slug}`,
      siteName: siteConfig.name,
      type: "article",
      images: project.cover_image
        ? [{ url: normalizeImageUrl(project.cover_image), width: 1200, height: 630, alt: project.title }]
        : [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: project.cover_image ? [normalizeImageUrl(project.cover_image)] : ["/og-image.png"],
      site: TWITTER_SITE_HANDLE,
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
  const catalogue = project.catalogue;
  const showHero = !catalogue || Boolean(project.cover_image);
  const heading = formatHeading(project.title);
  const projectServices = project.services.length
    ? project.services.join(", ")
    : "stratégie digitale, contenu, visibilité et suivi de performance";

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
      {showHero && (
        <div className="relative w-full overflow-hidden">
          {/* Image / Vidéo de couverture */}
          <div className={catalogue ? "relative w-full aspect-[18/7] min-h-[220px] max-h-[380px]" : "relative w-full aspect-[21/9] min-h-[320px] max-h-[600px]"}>
            {project.cover_image ? (
              isVideoUrl(project.cover_image) ? (
                <VideoPlayer
                  src={normalizeImageUrl(project.cover_image)}
                  captionSrc={getVideoCaptionSrc(project, project.cover_image)}
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <Image
                  src={normalizeImageUrl(project.cover_image)}
                  alt={project.title}
                  fill
                  sizes="100vw"
                  unoptimized={shouldBypassImageOptimization(project.cover_image)}
                  className="object-cover"
                  preload
                  fetchPriority="high"
                />
              )
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/20 to-[var(--muted)]" />
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/40 to-transparent" />
          </div>
        </div>
      )}

      <article className={`container-px mx-auto max-w-7xl pb-24 ${showHero ? "-mt-8" : "pt-28 sm:pt-32"}`}>
        {/* ── Breadcrumb ───────────────────────────────────────────────── */}
        <nav aria-label="Fil d'Ariane" className="mb-8">
          <Link
            href="/realisations"
            title="Toutes les réalisations Prestigia Agency"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--accent-gold)] transition-colors"
          >
            <ArrowLeft className="size-4" /> Toutes les réalisations
          </Link>
        </nav>

        <div className="grid lg:grid-cols-[1fr_300px] gap-16">
          {/* ── Colonne principale ──────────────────────────────────────── */}
          <div>
            {/* En-tête */}
            <span className="text-xs font-normal uppercase tracking-widest text-[var(--accent-gold-text)]">
              {project.sector}
            </span>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl leading-tight">
              {heading}
            </h1>
            {heading !== project.title && (
              <p className="mt-3 text-base text-[var(--muted-foreground)]">{project.title}</p>
            )}
            {project.description && (
              <p className="mt-6 text-lg text-[var(--muted-foreground)] leading-relaxed max-w-2xl">
                {project.description}
              </p>
            )}

            {catalogue ? (
              <ProjectCatalogueFrame catalogue={catalogue} project={project} />
            ) : (
              /* ── Objectif / Solution / Résultats ─────────────────────── */
              <div className="mt-12 grid gap-6 sm:grid-cols-3">
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
                      <p className="mb-3 text-xs font-normal uppercase tracking-widest text-[var(--accent-gold-text)]">
                        {card.label}
                      </p>
                      <p className="text-sm leading-relaxed">{card.content}</p>
                    </div>
                ))}
              </div>
            )}

            <section className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6 sm:p-8" aria-label="Lecture stratégique du projet">
              <h2 className="font-serif text-2xl">Lecture stratégique du projet</h2>
              <div className="mt-5 grid gap-5 text-sm leading-7 text-muted-foreground sm:grid-cols-2">
                <p>
                  Cette réalisation montre comment Prestigia Agency transforme un besoin client en plan d&apos;action clair.
                  Pour {project.client_name || project.title}, l&apos;analyse a porté sur le secteur {project.sector}, la
                  perception de marque, les contenus nécessaires et les points de contact capables de créer plus de
                  confiance avant la prise de décision.
                </p>
                <p>
                  Les leviers mobilisés couvrent {projectServices}. L&apos;objectif n&apos;est pas seulement de produire un rendu
                  esthétique, mais de créer une base exploitable : supports de communication, messages compréhensibles,
                  preuves visuelles, suivi des résultats et amélioration continue selon les réactions du marché.
                </p>
              </div>
            </section>

            {/* ── Sections richtext ────────────────────────────────────── */}
            {project.sections.map((section, idx) => (
              <div key={idx} className="mt-16">
                {/* Numéro de section */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl font-serif text-[var(--accent-gold-text)]/60 font-bold leading-none select-none">
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
                            <VideoPlayer
                              src={normalizeImageUrl(url)}
                              captionSrc={getVideoCaptionSrc(project, url)}
                              className="absolute inset-0 w-full h-full"
                            />
                          ) : (
                            <Image
                              src={normalizeImageUrl(url)}
                              alt={`${section.title} — visuel ${mIdx + 1}`}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              unoptimized={shouldBypassImageOptimization(url)}
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
                        <VideoPlayer
                          src={normalizeImageUrl(url)}
                          captionSrc={getVideoCaptionSrc(project, url)}
                          className="absolute inset-0 w-full h-full"
                        />
                      ) : (
                        <Image
                          src={normalizeImageUrl(url)}
                          alt={`${project.title} — photo ${i + 1}`}
                          fill
                          sizes="(max-width: 640px) 50vw, 33vw"
                          unoptimized={shouldBypassImageOptimization(url)}
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
                  <p className="mt-5 text-sm font-medium text-[var(--accent-gold-text)]">
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
                  unoptimized={shouldBypassImageOptimization(project.logo_url)}
                  className="h-16 w-auto object-contain"
                />
              </div>
            )}

            {/* Infos */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6 space-y-5">
              <div>
                <p className="text-xs font-normal uppercase tracking-widest text-[var(--accent-gold-text)] mb-1">
                  Client
                </p>
                <p className="font-medium">{project.client_name}</p>
              </div>
              <div className="border-t border-[var(--border)]" />
              <div>
                <p className="text-xs font-normal uppercase tracking-widest text-[var(--accent-gold-text)] mb-1">
                  Secteur
                </p>
                <p className="font-medium">{project.sector}</p>
              </div>
              <div className="border-t border-[var(--border)]" />
              {project.services.length > 0 && (
                <div>
                  <p className="text-xs font-normal uppercase tracking-widest text-[var(--accent-gold-text)] mb-3">
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
              title={`Contacter Prestigia Agency pour un projet similaire à ${project.title}`}
              className="block w-full text-center rounded-2xl bg-[var(--accent-gold)] text-white font-normal py-4 px-6 transition-all duration-200 hover:bg-[var(--accent-gold-hover)] hover:shadow-[0_0_24px_var(--accent-gold)/40]"
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
                  title={`Voir la réalisation ${p.title}`}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--muted)] overflow-hidden transition-all duration-300 hover:border-[var(--accent-gold)]/40"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {p.cover_image ? (
                      <Image
                        src={normalizeImageUrl(p.cover_image)}
                        alt={p.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        unoptimized={shouldBypassImageOptimization(p.cover_image)}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-gold)]/10 to-[var(--border)]" />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-medium text-[var(--accent-gold-text)]">{p.sector}</p>
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
