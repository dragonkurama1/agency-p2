import { unstable_cache } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase";

/**
 * Table `settings` : paires clé/valeur (téléphone, email, adresse, réseaux...).
 * Permet de modifier les coordonnées de l'agence depuis le dashboard admin.
 * En l'absence de données, lib/site-config.ts (valeurs codées) fait foi.
 */
async function fetchSettings(): Promise<Record<string, string>> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("settings").select("key, value");
    if (error) throw error;
    const map: Record<string, string> = {};
    (data ?? []).forEach((r) => {
      if (r.key) map[r.key] = r.value ?? "";
    });
    return map;
  } catch {
    return {};
  }
}

const getSettings = unstable_cache(fetchSettings, ["settings"], {
  tags: ["settings"],
  revalidate: 3600,
});

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const settings = await getSettings();
  return settings[key] ?? fallback;
}
