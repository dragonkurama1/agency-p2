"use server";

import { randomUUID } from "crypto";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { entities } from "@/lib/entities";
import { appendSheetRow, deleteSheetRowById, isGoogleSheetsConfigured, updateSheetRowById } from "@/lib/google/sheets";

export interface ContentState {
  success: boolean;
  message: string;
}


function buildRowFromFormData(entityKey: string, formData: FormData) {
  const config = entities[entityKey];
  const row: Record<string, string> = {};

  for (const field of config.fields) {
    if (field.type === "boolean") {
      row[field.key] = formData.get(field.key) === "on" ? "true" : "false";
      continue;
    }
    const value = formData.get(field.key);
    row[field.key] = typeof value === "string" ? value.trim() : "";
  }

  return { config, row };
}

function validateJsonFields(config: (typeof entities)[string], row: Record<string, string>): string | null {
  for (const field of config.fields) {
    if (field.type === "json" && row[field.key]) {
      try {
        JSON.parse(row[field.key]);
      } catch {
        return `Le champ "${field.label}" doit être un JSON valide.`;
      }
    }
  }
  return null;
}

export async function createEntityRow(entityKey: string, _prevState: ContentState, formData: FormData): Promise<ContentState> {
  const config = entities[entityKey];
  if (!config) return { success: false, message: "Type de contenu inconnu." };

  const { row } = buildRowFromFormData(entityKey, formData);

  const jsonError = validateJsonFields(config, row);
  if (jsonError) return { success: false, message: jsonError };

  for (const field of config.fields) {
    if (field.required && !row[field.key]) {
      return { success: false, message: `Le champ "${field.label}" est requis.` };
    }
  }

  row.id = row.id || randomUUID();
  const now = new Date().toISOString();
  if (config.fields.some((f) => f.key === "created_at")) row.created_at = row.created_at || now;
  if (config.fields.some((f) => f.key === "updated_at")) row.updated_at = now;

  if (!isGoogleSheetsConfigured()) {
    return {
      success: false,
      message: "Google Sheets n'est pas configuré (.env) — impossible d'écrire les données. Voir README.",
    };
  }

  try {
    await appendSheetRow(config.tab, config.fields.map((f) => f.key), row);
    revalidateTag(config.tab, "max");
  } catch (error) {
    console.error("createEntityRow", error);
    return { success: false, message: "Erreur lors de l'enregistrement. Réessayez." };
  }

  redirect(`/dashboard/${entityKey}`);
}

export async function updateEntityRow(
  entityKey: string,
  id: string,
  _prevState: ContentState,
  formData: FormData
): Promise<ContentState> {
  const config = entities[entityKey];
  if (!config) return { success: false, message: "Type de contenu inconnu." };

  const { row } = buildRowFromFormData(entityKey, formData);

  const jsonError = validateJsonFields(config, row);
  if (jsonError) return { success: false, message: jsonError };

  if (config.fields.some((f) => f.key === "updated_at")) {
    row.updated_at = new Date().toISOString();
  }

  if (!isGoogleSheetsConfigured()) {
    return {
      success: false,
      message: "Google Sheets n'est pas configuré (.env) — impossible d'écrire les données. Voir README.",
    };
  }

  try {
    await updateSheetRowById(config.tab, config.fields.map((f) => f.key), id, row);
    revalidateTag(config.tab, "max");
  } catch (error) {
    console.error("updateEntityRow", error);
    return { success: false, message: "Erreur lors de la mise à jour. Réessayez." };
  }

  redirect(`/dashboard/${entityKey}`);
}

export async function deleteEntityRow(entityKey: string, id: string) {
  const config = entities[entityKey];
  if (!config || !isGoogleSheetsConfigured()) return;

  try {
    await deleteSheetRowById(config.tab, id);
    revalidateTag(config.tab, "max");
  } catch (error) {
    console.error("deleteEntityRow", error);
  }
}
