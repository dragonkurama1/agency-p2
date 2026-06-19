import { unstable_cache } from "next/cache";
import { isGoogleSheetsConfigured, getSheetRows } from "@/lib/google/sheets";
import { parseBool, parseNumber, sortByOrder } from "@/lib/parse";
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

function mapRow(row: Record<string, string>): Partner {
  return {
    id: row.id,
    name: row.name,
    logo_url: row.logo_url || "",
    website: row.website || "",
    description: row.description || "",
    order: parseNumber(row.order, 99),
    active: parseBool(row.active, true),
  };
}

async function fetchPartners(): Promise<Partner[]> {
  if (!isGoogleSheetsConfigured()) return sortByOrder(seedPartners);
  try {
    const rows = await getSheetRows<Record<string, string>>("partners");
    const mapped = rows.map(mapRow).filter((p) => p.active);
    return sortByOrder(mapped.length ? mapped : seedPartners);
  } catch {
    return sortByOrder(seedPartners);
  }
}

export const getPartners = unstable_cache(fetchPartners, ["partners"], { tags: ["partners"], revalidate: 3600 });
