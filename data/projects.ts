import { unstable_cache } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase";
import { catalogueProjects, projects as seedProjects } from "@/lib/seed-data";

interface ProjectSection {
  title: string;
  text: string;
  media: string[];
}

interface ProjectCatalogueMetric {
  label: string;
  value: string;
  detail?: string;
}

interface ProjectCatalogueStep {
  title: string;
  text: string;
}

interface ProjectCatalogueExample {
  title: string;
  format: string;
  description: string;
  proof?: string;
}

export interface ProjectCatalogue {
  eyebrow: string;
  title: string;
  summary: string;
  vision: string;
  audience: string;
  metrics: ProjectCatalogueMetric[];
  workflow: ProjectCatalogueStep[];
  examples: ProjectCatalogueExample[];
  quality: string[];
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  category: string;
  sector: string;
  description: string;
  services: string[];
  logo_url: string;
  objective: string;
  solution: string;
  results: string;
  cover_image: string;
  gallery: string[];
  video_url: string;
  sections: ProjectSection[];
  featured: boolean;
  testimonial_quote: string;
  testimonial_author: string;
  meta_title: string;
  meta_description: string;
  active: boolean;
  catalogue?: ProjectCatalogue | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function normalizeCatalogue(value: unknown): ProjectCatalogue | null {
  if (!isRecord(value)) return null;

  const metrics = Array.isArray(value.metrics)
    ? value.metrics.filter(isRecord).map((metric) => ({
        label: String(metric.label ?? ""),
        value: String(metric.value ?? ""),
        detail: metric.detail ? String(metric.detail) : undefined,
      })).filter((metric) => metric.label && metric.value)
    : [];

  const workflow = Array.isArray(value.workflow)
    ? value.workflow.filter(isRecord).map((step) => ({
        title: String(step.title ?? ""),
        text: String(step.text ?? ""),
      })).filter((step) => step.title && step.text)
    : [];

  const examples = Array.isArray(value.examples)
    ? value.examples.filter(isRecord).map((example) => ({
        title: String(example.title ?? ""),
        format: String(example.format ?? ""),
        description: String(example.description ?? ""),
        proof: example.proof ? String(example.proof) : undefined,
      })).filter((example) => example.title && example.format && example.description)
    : [];

  return {
    eyebrow: String(value.eyebrow ?? "Catalogue étude projet"),
    title: String(value.title ?? ""),
    summary: String(value.summary ?? ""),
    vision: String(value.vision ?? ""),
    audience: String(value.audience ?? ""),
    metrics,
    workflow,
    examples,
    quality: normalizeStringArray(value.quality),
  };
}

const localCatalogueBySlug = new Map(
  catalogueProjects.map((project) => [project.slug, normalizeCatalogue("catalogue" in project ? project.catalogue : null)]),
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    client_name: row.client_name || "",
    category: row.category || row.sector || "",
    sector: row.sector || row.category || "",
    description: row.description || "",
    services: Array.isArray(row.services_json) ? row.services_json : [],
    logo_url: row.logo_url || "",
    objective: row.objective || "",
    solution: row.solution || "",
    results: row.results || "",
    cover_image: row.cover_image || "",
    gallery: Array.isArray(row.gallery_json) ? row.gallery_json : [],
    video_url: row.video_url || "",
    sections: Array.isArray(row.sections_json) ? row.sections_json : [],
    featured: row.featured ?? false,
    testimonial_quote: row.testimonial_quote || "",
    testimonial_author: row.testimonial_author || "",
    meta_title: row.meta_title || "",
    meta_description: row.meta_description || "",
    active: row.active ?? true,
    catalogue: normalizeCatalogue(row.catalogue_json) ?? localCatalogueBySlug.get(row.slug) ?? null,
  };
}

function mapSeedProject(project: (typeof seedProjects)[number]): Project {
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    client_name: project.client_name || "",
    category: project.category || project.sector || "",
    sector: project.sector || project.category || "",
    description: project.description || "",
    services: project.services || [],
    logo_url: project.logo_url || "",
    objective: project.objective || "",
    solution: project.solution || "",
    results: project.results || "",
    cover_image: project.cover_image || "",
    gallery: project.gallery || [],
    video_url: project.video_url || "",
    sections: project.sections || [],
    featured: project.featured ?? false,
    testimonial_quote: project.testimonial_quote || "",
    testimonial_author: project.testimonial_author || "",
    meta_title: project.meta_title || "",
    meta_description: project.meta_description || "",
    active: project.active ?? true,
    catalogue: normalizeCatalogue("catalogue" in project ? project.catalogue : null) ?? localCatalogueBySlug.get(project.slug) ?? null,
  };
}

function withCatalogueProjects(projects: Project[]): Project[] {
  const slugs = new Set(projects.map((project) => project.slug));
  const missingCatalogueProjects = catalogueProjects
    .filter((project) => project.active !== false && !slugs.has(project.slug))
    .map(mapSeedProject);

  return [...missingCatalogueProjects, ...projects];
}

async function fetchProjects(): Promise<Project[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    const mapped = (data ?? []).map(mapRow).filter((project) => {
      const hasPublishableContent =
        Boolean(project.cover_image) ||
        Boolean(project.category) ||
        Boolean(project.sector) ||
        Boolean(project.description);

      return Boolean(project.slug && project.title && hasPublishableContent);
    });
    return withCatalogueProjects(mapped.length ? mapped : seedProjects.map(mapSeedProject));
  } catch {
    return seedProjects.map(mapSeedProject);
  }
}

export const getProjects = unstable_cache(fetchProjects, ["projects", "catalogue-filled-v4"], {
  tags: ["projects"],
  revalidate: 3600,
});

export async function getProjectBySlug(slug: string) {
  const all = await getProjects();
  return all.find((p) => p.slug === slug);
}

export async function getProjectSectors(): Promise<string[]> {
  const all = await getProjects();
  return Array.from(new Set(all.map((p) => p.sector || p.category))).filter(Boolean).sort();
}
