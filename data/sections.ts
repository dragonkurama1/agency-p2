import { unstable_cache } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase";

export interface SectionContent {
  id: string;
  page_slug: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  order: number;
  active: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): SectionContent {
  return {
    id: row.id,
    page_slug: row.page_slug,
    section_key: row.section_key,
    title: row.title ?? null,
    subtitle: row.subtitle ?? null,
    content: row.content ?? null,
    image_url: row.image_url ?? null,
    button_text: row.button_text ?? null,
    button_link: row.button_link ?? null,
    order: row.order ?? 0,
    active: row.active ?? true,
  };
}

async function fetchSectionsByPage(pageSlug: string): Promise<SectionContent[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("sections")
      .select("*")
      .eq("page_slug", pageSlug)
      .eq("active", true)
      .order("order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  } catch {
    return [];
  }
}

/** Toutes les sections actives d'une page, triées par ordre. */
function getSectionsByPage(pageSlug: string) {
  return unstable_cache(
    () => fetchSectionsByPage(pageSlug),
    [`sections-${pageSlug}`, "content-v2"],
    { tags: ["sections", `sections-${pageSlug}`], revalidate: 3600 }
  )();
}

/** Une section précise par sa clé (ex: "hero", "cta"). Retourne null si absente. */
export async function getSectionByKey(
  pageSlug: string,
  sectionKey: string
): Promise<SectionContent | null> {
  const sections = await getSectionsByPage(pageSlug);
  return sections.find((s) => s.section_key === sectionKey) ?? null;
}
