/**
 * @deprecated Migré vers Supabase. Ce fichier peut être supprimé manuellement.
 */

export function isGoogleSheetsConfigured(): boolean {
  return false;
}

export async function getSheetRows<T = Record<string, string>>(_tab: string): Promise<T[]> {
  return [];
}

export async function appendSheetRow(
  _tab: string,
  _columns: string[],
  _row: Record<string, unknown>
): Promise<void> {
  throw new Error("Google Sheets supprimé — utiliser Supabase.");
}

export async function updateSheetRowById(
  _tab: string,
  _columns: string[],
  _id: string,
  _row: Record<string, unknown>
): Promise<void> {
  throw new Error("Google Sheets supprimé — utiliser Supabase.");
}

export async function deleteSheetRowById(_tab: string, _id: string): Promise<void> {
  throw new Error("Google Sheets supprimé — utiliser Supabase.");
}
