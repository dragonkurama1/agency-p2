import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
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
  return {
    title: project.title,
    description: project.objective || project.results,
    alternates: { canonical: `/realisations/${slug}` },
    openGraph: {
      title: `${project.title} — Prestigia Agency`,
      description: project.objective || project.results,
      images: project.cover_image
        ? [{ url: normalizeImageUrl(project.cover_image), width: 1200, height: 630, alt: project.title }]
        : [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — Prestigia Agency`,
      description: project.objective || project.results,
      images: project.cover_image ? [normalizeImageUrl(project.cover_image)] : ["/og-image.png"],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <WebPageJsonLd
        title={project.title}
        description={project.objective || project.results}
        path={`/realisations/${slug}`}
        breadcrumbs={[
          { name: "Réalisations", href: "/realisations" },
          { name: project.title, href: `/realisations/${slug}` },
        ]}
      />

      <article className="container-px mx-auto max-w-3xl py-20">
        <nav aria-label="Fil d'Ariane">
          <Link href="/realisations" className="text-sm text-muted-foreground hover:text-[var(--accent-gold)]">
            ← Toutes les réalisations
          </Link>
        </nav>
        <p className="mt-6 text-xs uppercase tracking-wide text-[var(--accent-gold)]">{project.category}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight">{project.title}</h1>
        <p className="mt-3 text-muted-foreground">
          {project.client_name} — {project.sector}
        </p>

        {project.cover_image ? (
          isVideoUrl(project.cover_image) ? (
            <VideoPlayer src={normalizeImageUrl(project.cover_image)} className="mt-10 aspect-[16/9] w-full" />
          ) : (
            <div className="mt-10 relative w-full aspect-[16/9] rounded-2xl overflow-hidden">
              <Image
                src={normalizeImageUrl(project.cover_image)}
                alt={`Réalisation : ${project.title}`}
                fill
                sizes="(max-width: 768px) 100vw, 960px"
                className="object-cover"
                priority
              />
            </div>
          )
        ) : (
          <div
            className="mt-10 aspect-[16/9] rounded-2xl bg-[linear-gradient(135deg,var(--border),var(--muted))]"
            aria-hidden="true"
          />
        )}

        <div className="mt-12 grid sm:grid-cols-3 gap-8">
          <section aria-label="Objectif du projet">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-gold)]">Objectif</h2>
            <p className="mt-2 text-sm">{project.objective}</p>
          </section>
          <section aria-label="Solution apportée">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-gold)]">Solution</h2>
            <p className="mt-2 text-sm">{project.solution}</p>
          </section>
          <section aria-label="Résultats obtenus">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-gold)]">Résultats</h2>
            <p className="mt-2 text-sm">{project.results}</p>
          </section>
        </div>
      </article>
      <CtaBanner />
    </>
  );
}
