import { unstable_cache } from "next/cache";
import { isGoogleSheetsConfigured, getSheetRows } from "@/lib/google/sheets";
import { parseBool, parseNumber, sortByOrder } from "@/lib/parse";
import { homeFaq } from "@/lib/seed-data";

export interface FaqItem {
  id: string;
  page_slug: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

function mapRow(row: Record<string, string>): FaqItem {
  return {
    id: row.id,
    page_slug: row.page_slug || "accueil",
    question: row.question,
    answer: row.answer,
    order: parseNumber(row.order, 99),
    active: parseBool(row.active, true),
  };
}

async function fetchFaq(): Promise<FaqItem[]> {
  if (!isGoogleSheetsConfigured()) {
    return homeFaq.map((f, i) => ({ id: String(i), page_slug: "accueil", order: i, active: true, ...f }));
  }
  try {
    const rows = await getSheetRows<Record<string, string>>("faq");
    const mapped = rows.map(mapRow).filter((f) => f.active);
    if (mapped.length) return sortByOrder(mapped);
    return homeFaq.map((f, i) => ({ id: String(i), page_slug: "accueil", order: i, active: true, ...f }));
  } catch {
    return homeFaq.map((f, i) => ({ id: String(i), page_slug: "accueil", order: i, active: true, ...f }));
  }
}

export const getFaq = unstable_cache(fetchFaq, ["faq"], { tags: ["faq"], revalidate: 3600 });

export async function getFaqByPage(pageSlug: string) {
  const all = await getFaq();
  return all.filter((f) => f.page_slug === pageSlug);
}
