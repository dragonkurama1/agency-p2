import { unstable_cache } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase";
import { parseNumber, sortByOrder } from "@/lib/parse";
import { partners as seedPartners } from "@/lib/seed-data";

export interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website: string;
  description: string;
  order: number;
  active: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): Partner {
  return {
    id: row.id,
    name: row.name,
    logo_url: row.logo_url || "",
    website: row.website || "",
    description: row.description || "",
    order: parseNumber(row.order, 99),
    active: row.active ?? true,
  };
}

async function fetchPartners(): Promise<Partner[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .eq("active", true)
      .order("order", { ascending: true });
    if (error) throw error;
    const mapped = (data ?? []).map(mapRow);
    return sortByOrder(mapped.length ? mapped : seedPartners);
  } catch {
    return sortByOrder(seedPartners);
  }
}

export const getPartners = unstable_cache(fetchPartners, ["partners"], { tags: ["partners"], revalidate: 3600 });
