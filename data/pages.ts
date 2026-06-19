import { unstable_cache } from "next/cache";
import { isGoogleSheetsConfigured, getSheetRows } from "@/lib/google/sheets";

export interface PageContent {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  status: string;
}

function mapRow(row: Record<string, string>): PageContent {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle || "",
    content: row.content || "",
    meta_title: row.meta_title || row.title,
    meta_description: row.meta_description || "",
    og_image: row.og_image || "",
    status: row.status || "published",
  };
}

async function fetchPages(): Promise<PageContent[]> {
  if (!isGoogleSheetsConfigured()) return [];
  try {
    const rows = await getSheetRows<Record<string, string>>("pages");
    return rows.map(mapRow).filter((p) => p.status === "published");
  } catch {
    return [];
  }
}

export const getPages = unstable_cache(fetchPages, ["pages"], { tags: ["pages"], revalidate: 3600 });

export async function getPageBySlug(slug: string) {
  const all = await getPages();
  return all.find((p) => p.slug === slug);
}
