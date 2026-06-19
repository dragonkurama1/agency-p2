import { unstable_cache } from "next/cache";
import { isGoogleSheetsConfigured, getSheetRows } from "@/lib/google/sheets";
import { parseBool, parseNumber, sortByOrder } from "@/lib/parse";
import { team as seedTeam } from "@/lib/seed-data";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string;
  linkedin: string;
  instagram: string;
  order: number;
  active: boolean;
}

function mapRow(row: Record<string, string>): TeamMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    bio: row.bio,
    photo_url: row.photo_url || "",
    linkedin: row.linkedin || "",
    instagram: row.instagram || "",
    order: parseNumber(row.order, 99),
    active: parseBool(row.active, true),
  };
}

async function fetchTeam(): Promise<TeamMember[]> {
  if (!isGoogleSheetsConfigured()) return sortByOrder(seedTeam);
  try {
    const rows = await getSheetRows<Record<string, string>>("team");
    const mapped = rows.map(mapRow).filter((t) => t.active);
    return sortByOrder(mapped.length ? mapped : seedTeam);
  } catch {
    return sortByOrder(seedTeam);
  }
}

export const getTeam = unstable_cache(fetchTeam, ["team"], { tags: ["team"], revalidate: 3600 });
