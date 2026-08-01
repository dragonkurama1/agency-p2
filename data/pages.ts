import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import { getSupabaseClient } from "@/lib/supabase";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): PageContent {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title || "",
    subtitle: row.subtitle || "",
    content: row.content || "",
    meta_title: row.meta_title || row.title || "",
    meta_description: row.meta_description || "",
    og_image: row.og_image || "",
    status: row.status || "published",
  };
}

async function fetchPages(): Promise<PageContent[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("status", "published");
    if (error) throw error;
    return (data ?? []).map(mapRow);
  } catch {
    return [];
  }
}

export const getPages = unstable_cache(fetchPages, ["pages"], { tags: ["pages"], revalidate: 3600 });

export async function getPageBySlug(slug: string) {
  const all = await getPages();
  return all.find((p) => p.slug === slug);
}

/**
 * Génère les métadonnées Next.js pour une page en lisant la table `pages`.
 * Utilise les valeurs de la BDD si elles existent, sinon fall back sur `defaults`.
 */
export async function getPageMeta(
  slug: string,
  defaults: {
    title: string;
    description: string;
    ogTitle?: string;
    canonical?: string;
  }
): Promise<Metadata> {
  const page = await getPageBySlug(slug);
  const canonical = defaults.canonical ?? (slug === "home" ? "/" : `/${slug}`);
  const title = page?.meta_title || defaults.title;
  const description = page?.meta_description || defaults.description;
  const ogTitle = page?.meta_title || defaults.ogTitle || defaults.title;
  const ogImages = page?.og_image
    ? [{ url: page.og_image, width: 1200, height: 630, alt: ogTitle }]
    : [{ url: "/og-image.png", width: 1200, height: 630, alt: ogTitle }];

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: ogTitle, description, images: ogImages },
    twitter: { card: "summary_large_image", title: ogTitle, description, images: [ogImages[0].url] },
  };
}
