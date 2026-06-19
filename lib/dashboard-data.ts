import { entities } from "@/lib/entities";
import { getSheetRows, isGoogleSheetsConfigured } from "@/lib/google/sheets";

/**
 * Données brutes pour le dashboard (toujours fraîches, jamais mises en cache
 * comme le sont les fetchers publics dans data/*.ts). Si Google Sheets n'est
 * pas configuré, le dashboard ne peut pas éditer de contenu — seul le site
 * public bascule sur les données de démo (lib/seed-data.ts).
 */
export async function getEntityRows(entityKey: string): Promise<Record<string, string>[]> {
  const config = entities[entityKey];
  if (!config || !isGoogleSheetsConfigured()) return [];
  return getSheetRows<Record<string, string>>(config.tab);
}

export async function getEntityRowById(entityKey: string, id: string): Promise<Record<string, string> | null> {
  const rows = await getEntityRows(entityKey);
  return rows.find((r) => r.id === id) ?? null;
}
