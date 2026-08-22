import { unstable_cache } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase";

async function fetchCategoriesByEntity(entity: string): Promise<string[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .select("name")
      .eq("entity", entity)
      .eq("active", true)
      .order("order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r) => r.name as string).filter(Boolean);
  } catch {
    return [];
  }
}

const getCategoriesByEntity = unstable_cache(
  fetchCategoriesByEntity,
  ["categories"],
  { tags: ["categories"], revalidate: 3600 }
);

/** Charge les catégories dynamiques pour plusieurs entités en parallèle.
 *  Retourne un map fieldKey → options[].
 *  Appeler avec les clés de champ qui ont un dynamicCategory déclaré.
 */
export async function getDynamicOptions(
  fields: { key: string; dynamicCategory?: string }[]
): Promise<Record<string, string[]>> {
  const pairs = fields.filter((f) => f.dynamicCategory);
  if (!pairs.length) return {};

  const results = await Promise.all(
    pairs.map((f) => getCategoriesByEntity(f.dynamicCategory!))
  );

  return Object.fromEntries(pairs.map((f, i) => [f.key, results[i]]));
}
