import { google } from "googleapis";

/**
 * Client Google Sheets (service account). N'est jamais importé côté client :
 * toutes les fonctions d'écriture passent par des Server Actions / Route Handlers.
 *
 * Configuration requise (.env) :
 *  GOOGLE_SERVICE_ACCOUNT_EMAIL
 *  GOOGLE_PRIVATE_KEY      (remplacer les \n littéraux par de vrais retours à la ligne, voir README)
 *  GOOGLE_SHEET_ID
 */

export function isGoogleSheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_SHEET_ID
  );
}

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

/** Lit un onglet entier et retourne des objets clé/valeur basés sur la ligne d'en-tête. */
export async function getSheetRows<T = Record<string, string>>(tab: string): Promise<T[]> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: `${tab}!A1:Z`,
  });
  const rows = res.data.values ?? [];
  if (rows.length === 0) return [];
  const [header, ...body] = rows;
  return body.map((row) => {
    const obj: Record<string, string> = {};
    header.forEach((key, i) => (obj[key] = row[i] ?? ""));
    return obj as T;
  });
}

/** Ajoute une ligne en fin d'onglet, dans l'ordre des colonnes fourni. */
export async function appendSheetRow(tab: string, columns: string[], values: Record<string, string>) {
  const sheets = getClient();
  const row = columns.map((c) => values[c] ?? "");
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: `${tab}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

/** Met à jour la ligne dont la colonne `id` correspond à `id` (recherche + update ciblé). */
export async function updateSheetRowById(tab: string, columns: string[], id: string, values: Record<string, string>) {
  const sheets = getClient();
  const existing = await getSheetRows<Record<string, string>>(tab);
  const rowIndex = existing.findIndex((r) => r.id === id);
  if (rowIndex === -1) throw new Error(`Ligne id=${id} introuvable dans ${tab}`);

  const merged = { ...existing[rowIndex], ...values };
  const row = columns.map((c) => merged[c] ?? "");
  const sheetRowNumber = rowIndex + 2; // +1 header, +1 1-indexed

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: `${tab}!A${sheetRowNumber}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

/** Retrouve le sheetId (gid) interne d'un onglet à partir de son titre. */
async function getSheetIdByTitle(tab: string): Promise<number> {
  const sheets = getClient();
  const res = await sheets.spreadsheets.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    fields: "sheets.properties",
  });
  const sheet = res.data.sheets?.find((s) => s.properties?.title === tab);
  if (sheet?.properties?.sheetId == null) throw new Error(`Onglet "${tab}" introuvable.`);
  return sheet.properties.sheetId;
}

/** Supprime la ligne dont la colonne `id` correspond à `id`. */
export async function deleteSheetRowById(tab: string, id: string) {
  const existing = await getSheetRows<Record<string, string>>(tab);
  const rowIndex = existing.findIndex((r) => r.id === id);
  if (rowIndex === -1) return;

  const sheetId = await getSheetIdByTitle(tab);
  const sheets = getClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: { sheetId, dimension: "ROWS", startIndex: rowIndex + 1, endIndex: rowIndex + 2 },
          },
        },
      ],
    },
  });
}
