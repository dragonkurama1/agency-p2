import { unstable_cache } from "next/cache";
import { isGoogleSheetsConfigured, getSheetRows } from "@/lib/google/sheets";

/**
 * Onglet `settings` : paires clé/valeur (téléphone, email, adresse, réseaux...).
 * Permet au dashboard de modifier les coordonnées de l'agence sans toucher au code.
 * En l'absence de Google Sheets, lib/site-config.ts (valeurs codées) fait foi.
 */
async function fetchSettings(): Promise<Record<string, string>> {
  if (!isGoogleSheetsConfigured()) return {};
  try {
    const rows = await getSheetRows<{ key: string; value: string }>("settings");
    const map: Record<string, string> = {};
    rows.forEach((r) => {
      if (r.key) map[r.key] = r.value ?? "";
    });
    return map;
  } catch {
    return {};
  }
}

export const getSettings = unstable_cache(fetchSettings, ["settings"], {
  tags: ["settings"],
  revalidate: 3600,
});

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const settings = await getSettings();
  return settings[key] ?? fallback;
}
