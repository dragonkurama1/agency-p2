import { unstable_cache } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase";
import { parseJsonSafe, parseNumber, sortByOrder } from "@/lib/parse";
import { services as seedServices, type Service } from "@/lib/seed-data";

type FaqItem = { question: string; answer: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): Service {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    short_description: row.short_description || "",
    full_description: row.full_description || "",
    icon: row.icon || "Sparkles",
    meta_title: row.meta_title || row.title,
    meta_description: row.meta_description || row.short_description || "",
    keywords: row.keywords || "",
    advantages: Array.isArray(row.advantages_json) ? row.advantages_json : parseJsonSafe<string[]>(row.advantages_json, []),
    process: Array.isArray(row.process_json) ? row.process_json : parseJsonSafe<string[]>(row.process_json, []),
    faq: Array.isArray(row.faq_json) ? row.faq_json : parseJsonSafe<FaqItem[]>(row.faq_json, []),
    related: Array.isArray(row.related_json) ? row.related_json : parseJsonSafe<string[]>(row.related_json, []),
    order: parseNumber(row.order, 99),
    active: row.active ?? true,
  };
}

async function fetchServices(): Promise<Service[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("order", { ascending: true });
    if (error) throw error;
    const mapped = (data ?? []).map(mapRow);
    return sortByOrder(mapped.length ? mapped : seedServices);
  } catch {
    return sortByOrder(seedServices);
  }
}

export const getServices = unstable_cache(fetchServices, ["services"], {
  tags: ["services"],
  revalidate: 3600,
});

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  const all = await getServices();
  return all.find((s) => s.slug === slug);
}
