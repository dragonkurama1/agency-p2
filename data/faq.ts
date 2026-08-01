import { unstable_cache } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase";
import { parseNumber, sortByOrder } from "@/lib/parse";
import { homeFaq } from "@/lib/seed-data";

export interface FaqItem {
  id: string;
  page_slug: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

function seedFallback(): FaqItem[] {
  return homeFaq.map((f, i) => ({ id: String(i), page_slug: "accueil", order: i, active: true, ...f }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): FaqItem {
  return {
    id: row.id,
    page_slug: row.page_slug || "accueil",
    question: row.question,
    answer: row.answer || "",
    order: parseNumber(row.order, 99),
    active: row.active ?? true,
  };
}

async function fetchFaq(): Promise<FaqItem[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("faq")
      .select("*")
      .eq("active", true)
      .order("order", { ascending: true });
    if (error) throw error;
    const mapped = (data ?? []).map(mapRow);
    return sortByOrder(mapped.length ? mapped : seedFallback());
  } catch {
    return seedFallback();
  }
}

export const getFaq = unstable_cache(fetchFaq, ["faq"], { tags: ["faq"], revalidate: 3600 });

export async function getFaqByPage(pageSlug: string) {
  const all = await getFaq();
  return all.filter((f) => f.page_slug === pageSlug);
}
