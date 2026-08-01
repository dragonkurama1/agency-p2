import { entities } from "@/lib/entities";
import { getSupabaseAdmin } from "@/lib/supabase";

/** Colonne utilisée pour trier les lignes dans le dashboard, par table. */
function getOrderColumn(tab: string): string {
  const map: Record<string, string> = {
    settings:      "key",
    services:      "order",
    team:          "order",
    partners:      "order",
    faq:           "order",
    sections:      "order",
    media:         "uploaded_at",
    blog_posts:    "published_at",
    testimonials:  "created_at",
    leads_contact: "created_at",
    leads_devis:   "created_at",
    projects:      "created_at",
    audit_log:     "created_at",
    pages:         "updated_at",
    seo_keywords:  "updated_at",
  };
  return map[tab] ?? "id";
}

/** Convertit une valeur Supabase (any) en string pour les composants dashboard. */
function toStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function normalizeRow(row: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, toStr(v)]));
}

/**
 * Données brutes pour le dashboard (toujours fraîches, sans cache).
 * Utilise le client service_role pour bypasser RLS et lire toutes les lignes.
 */
export async function getEntityRows(entityKey: string): Promise<Record<string, string>[]> {
  const config = entities[entityKey];
  if (!config) return [];

  try {
    const supabase = getSupabaseAdmin();
    const orderCol = getOrderColumn(config.tab);
    const { data, error } = await supabase
      .from(config.tab)
      .select("*")
      .order(orderCol, { ascending: true });
    if (error) throw error;
    return (data ?? []).map(normalizeRow);
  } catch (err) {
    console.error("getEntityRows", entityKey, err);
    return [];
  }
}

export async function getEntityRowById(entityKey: string, id: string): Promise<Record<string, string> | null> {
  const config = entities[entityKey];
  if (!config) return null;

  try {
    const supabase = getSupabaseAdmin();
    const pkField = config.tab === "settings" ? "key" : "id";
    const { data, error } = await supabase
      .from(config.tab)
      .select("*")
      .eq(pkField, id)
      .single();
    if (error) throw error;
    return data ? normalizeRow(data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
