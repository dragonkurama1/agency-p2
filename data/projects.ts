import { unstable_cache } from "next/cache";
import { isGoogleSheetsConfigured, getSheetRows } from "@/lib/google/sheets";
import { parseBool } from "@/lib/parse";
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

function mapRow(row: Record<string, string>): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    client_name: row.client_name,
    category: row.category,
    sector: row.sector,
    objective: row.objective,
    solution: row.solution,
    results: row.results,
    cover_image: row.cover_image || "",
    active: parseBool(row.active, true),
  };
}

async function fetchProjects(): Promise<Project[]> {
  if (!isGoogleSheetsConfigured()) return seedProjects;
  try {
    const rows = await getSheetRows<Record<string, string>>("projects");
    const mapped = rows.map(mapRow).filter((p) => p.active);
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
