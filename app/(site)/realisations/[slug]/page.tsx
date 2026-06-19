import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjects, getProjectBySlug } from "@/data/projects";
import { CtaBanner } from "@/components/marketing/cta-banner";

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
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <section className="container-px mx-auto max-w-3xl py-20">
        <Link href="/realisations" className="text-sm text-muted-foreground hover:text-[var(--accent-gold)]">
          ← Toutes les réalisations
        </Link>
        <p className="mt-6 text-xs uppercase tracking-wide text-[var(--accent-gold)]">{project.category}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight">{project.title}</h1>
        <p className="mt-3 text-muted-foreground">
          {project.client_name} — {project.sector}
        </p>

        <div className="mt-10 aspect-[16/9] rounded-2xl bg-[linear-gradient(135deg,var(--border),var(--muted))]" />

        <div className="mt-12 grid sm:grid-cols-3 gap-8">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-gold)]">Objectif</h2>
            <p className="mt-2 text-sm">{project.objective}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-gold)]">Solution</h2>
            <p className="mt-2 text-sm">{project.solution}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--accent-gold)]">Résultats</h2>
            <p className="mt-2 text-sm">{project.results}</p>
          </div>
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
