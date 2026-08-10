"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { entities } from "@/lib/entities";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export interface ContentState {
  success: boolean;
  message: string;
}

/**
 * Champs gérés automatiquement par la BDD — jamais envoyés depuis le formulaire.
 * CREATE : id, created_at, updated_at, uploaded_at (triggers / DEFAULT)
 * UPDATE : idem + never change the PK
 */
const SKIP_ON_CREATE = new Set(["id", "created_at", "updated_at", "uploaded_at"]);
const SKIP_ON_UPDATE = new Set(["id", "created_at", "uploaded_at", "updated_at"]);

function buildRow(
  entityKey: string,
  formData: FormData,
  mode: "create" | "update"
): { config: (typeof entities)[string]; row: Record<string, unknown> } {
  const config = entities[entityKey];
  const skip = mode === "create" ? SKIP_ON_CREATE : SKIP_ON_UPDATE;

  const row: Record<string, unknown> = {};

  for (const field of config.fields) {
    // Skip auto-managed fields
    if (skip.has(field.key)) continue;
    // On UPDATE, don't overwrite the PK (settings uses 'key' instead of 'id')
    if (mode === "update" && field.key === "key" && config.tab === "settings") continue;

    if (field.type === "boolean") {
      row[field.key] = formData.get(field.key) === "on";
      continue;
    }

    if (field.type === "number") {
      const val = formData.get(field.key);
      row[field.key] = val !== null && val !== "" ? Number(val) : null;
      continue;
    }

    if (field.type === "json") {
      const val = formData.get(field.key);
      if (val && typeof val === "string" && val.trim()) {
        try {
          row[field.key] = JSON.parse(val);
        } catch {
          row[field.key] = val; // caught by validateJsonFields below
        }
      } else {
        row[field.key] = null;
      }
      continue;
    }

    if (field.type === "date") {
      // Empty date → omit entirely so the DB keeps its default / existing value
      const val = formData.get(field.key);
      const v = typeof val === "string" ? val.trim() : "";
      if (v) row[field.key] = v;
      continue;
    }

    const value = formData.get(field.key);
    row[field.key] = typeof value === "string" ? value.trim() : null;
  }

  if (entityKey === "projects") {
    const category = typeof row.category === "string" ? row.category.trim() : "";
    const sector = typeof row.sector === "string" ? row.sector.trim() : "";

    if (category && !sector) row.sector = category;
    if (sector && !category) row.category = sector;
  }

  return { config, row };
}

function validateJsonFields(
  config: (typeof entities)[string],
  row: Record<string, unknown>
): string | null {
  for (const field of config.fields) {
    if (field.type === "json" && row[field.key] !== null && typeof row[field.key] === "string") {
      try {
        JSON.parse(row[field.key] as string);
      } catch {
        return `Le champ "${field.label}" doit être un JSON valide.`;
      }
    }
  }
  return null;
}

/** Écrit une ligne dans audit_log (silencieux en cas d'erreur). */
async function writeAuditLog(
  action: "create" | "update" | "delete",
  entityType: string,
  entityId: string,
  details?: Record<string, unknown>
) {
  try {
    const session = await getSession();
    const supabase = getSupabaseAdmin();
    await supabase.from("audit_log").insert({
      admin_email: session?.email ?? "unknown",
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: details ?? null,
    });
  } catch {
    // non-blocking — audit log failure must never break the main action
  }
}

// ── CREATE ─────────────────────────────────────────────────────────────────

export async function createEntityRow(
  entityKey: string,
  _prevState: ContentState,
  formData: FormData
): Promise<ContentState> {
  const config = entities[entityKey];
  if (!config) return { success: false, message: "Type de contenu inconnu." };

  const { row } = buildRow(entityKey, formData, "create");

  const jsonError = validateJsonFields(config, row);
  if (jsonError) return { success: false, message: jsonError };

  // Validate required fields
  for (const field of config.fields) {
    if (["id", "key", "created_at", "updated_at", "uploaded_at"].includes(field.key)) continue;
    if (field.required && !row[field.key]) {
      return { success: false, message: `Le champ "${field.label}" est requis.` };
    }
  }

  let insertedId = "";
  try {
    const supabase = getSupabaseAdmin();
    const pkField = config.tab === "settings" ? "key" : "id";
    const { data, error } = await supabase.from(config.tab).insert(row).select(pkField).single();
    if (error) throw error;
    insertedId = (data as Record<string, string>)?.[pkField] ?? "";
    revalidateTag(config.tab, "max");
  } catch (error) {
    console.error("createEntityRow", error);
    const msg = error instanceof Error ? error.message : "Erreur lors de l'enregistrement.";
    return { success: false, message: msg };
  }

  await writeAuditLog("create", entityKey, insertedId);
  redirect(`/dashboard/${entityKey}`);
}

// ── UPDATE ─────────────────────────────────────────────────────────────────

export async function updateEntityRow(
  entityKey: string,
  id: string,
  _prevState: ContentState,
  formData: FormData
): Promise<ContentState> {
  const config = entities[entityKey];
  if (!config) return { success: false, message: "Type de contenu inconnu." };

  const { row } = buildRow(entityKey, formData, "update");

  const jsonError = validateJsonFields(config, row);
  if (jsonError) return { success: false, message: jsonError };

  const pkField = config.tab === "settings" ? "key" : "id";

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from(config.tab).update(row).eq(pkField, id);
    if (error) throw error;
    revalidateTag(config.tab, "max");
  } catch (error) {
    console.error("updateEntityRow", error);
    const msg = error instanceof Error ? error.message : "Erreur lors de la mise à jour.";
    return { success: false, message: msg };
  }

  await writeAuditLog("update", entityKey, id);
  redirect(`/dashboard/${entityKey}`);
}

// ── DELETE ─────────────────────────────────────────────────────────────────

export async function deleteEntityRow(entityKey: string, id: string) {
  const config = entities[entityKey];
  if (!config) return;

  const pkField = config.tab === "settings" ? "key" : "id";

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from(config.tab).delete().eq(pkField, id);
    if (error) throw error;
    revalidateTag(config.tab, "max");
  } catch (error) {
    console.error("deleteEntityRow", error);
  }

  await writeAuditLog("delete", entityKey, id);
}
