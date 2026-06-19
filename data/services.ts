import { unstable_cache } from "next/cache";
import { isGoogleSheetsConfigured, getSheetRows } from "@/lib/google/sheets";
import { parseBool, parseJsonSafe, parseNumber, sortByOrder } from "@/lib/parse";
import { services as seedServices, type Service } from "@/lib/seed-data";

type FaqItem = { question: string; answer: string };

function mapRow(row: Record<string, string>): Service {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    short_description: row.short_description,
    full_description: row.full_description,
    icon: row.icon || "Sparkles",
    meta_title: row.meta_title || row.title,
    meta_description: row.meta_description || row.short_description,
    keywords: row.keywords || "",
    advantages: parseJsonSafe<string[]>(row.advantages_json, []),
    process: parseJsonSafe<string[]>(row.process_json, []),
    faq: parseJsonSafe<FaqItem[]>(row.faq_json, []),
    related: parseJsonSafe<string[]>(row.related_json, []),
    order: parseNumber(row.order, 99),
    active: parseBool(row.active, true),
  };
}

async function fetchServices(): Promise<Service[]> {
  if (!isGoogleSheetsConfigured()) return sortByOrder(seedServices);
  try {
    const rows = await getSheetRows<Record<string, string>>("services");
    const mapped = rows.map(mapRow).filter((s) => s.active);
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
