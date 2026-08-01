import { unstable_cache } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase";
import { projects as seedProjects } from "@/lib/seed-data";

export interface ProjectSection {
  title: string;
  text: string;
  media: string[];
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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    client_name: row.client_name || "",
    category: row.category || "",
    sector: row.sector || "",
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
  };
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
    const mapped = (data ?? []).map(mapRow);
    return mapped.length ? mapped : seedProjects;
  } catch {
    return seedProjects;
  }
}

export const getProjects = unstable_cache(fetchProjects, ["projects"], {
  tags: ["projects"],
  revalidate: 3600,
});

export async function getProjectBySlug(slug: string) {
  const all = await getProjects();
  return all.find((p) => p.slug === slug);
}

export async function getProjectSectors(): Promise<string[]> {
  const all = await getProjects();
  return Array.from(new Set(all.map((p) => p.sector))).filter(Boolean).sort();
}

export async function getProjectCategories(): Promise<string[]> {
  const all = await getProjects();
  return Array.from(new Set(all.map((p) => p.category))).filter(Boolean).sort();
}
