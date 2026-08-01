import { unstable_cache } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase";
import { parseNumber, sortByOrder } from "@/lib/parse";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): TeamMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role || "",
    bio: row.bio || "",
    photo_url: row.photo_url || "",
    linkedin: row.linkedin || "",
    instagram: row.instagram || "",
    order: parseNumber(row.order, 99),
    active: row.active ?? true,
  };
}

async function fetchTeam(): Promise<TeamMember[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("team")
      .select("*")
      .eq("active", true)
      .order("order", { ascending: true });
    if (error) throw error;
    const mapped = (data ?? []).map(mapRow);
    return sortByOrder(mapped.length ? mapped : seedTeam);
  } catch {
    return sortByOrder(seedTeam);
  }
}

export const getTeam = unstable_cache(fetchTeam, ["team"], { tags: ["team"], revalidate: 3600 });
