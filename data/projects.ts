import { unstable_cache } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase";
import { projects as seedProjects } from "@/lib/seed-data";

export interface Project {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  category: string;
  sector: string;
  objective: string;
  solution: string;
  results: string;
  cover_image: string;
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
    objective: row.objective || "",
    solution: row.solution || "",
    results: row.results || "",
    cover_image: row.cover_image || "",
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

export async function getProjectCategories() {
  const all = await getProjects();
  return Array.from(new Set(all.map((p) => p.category))).filter(Boolean);
}
