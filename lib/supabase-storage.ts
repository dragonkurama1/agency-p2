/**
 * Supabase Storage — helpers côté client (URLs publiques)
 *
 * Variables d'environnement requises (.env.local) :
 *   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * Buckets recommandés à créer dans Supabase Dashboard > Storage :
 *   - "media"  → images du site (public)
 *   - "team"   → photos des fondateurs (public)
 *   - "projects" → images des réalisations (public)
 *
 * Configuration des buckets : Public = true, MIME types autorisés = image/*
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const STORAGE_BASE = SUPABASE_URL ? `${SUPABASE_URL}/storage/v1/object/public` : null;

/**
 * Construit l'URL publique Supabase d'un fichier.
 *
 * @example
 * getSupabaseImageUrl("media", "mon-image.webp")
 * // => "https://xyz.supabase.co/storage/v1/object/public/media/mon-image.webp"
 */
export function getSupabaseImageUrl(bucket: string, path: string): string {
  if (!STORAGE_BASE) {
    console.warn("[Supabase] NEXT_PUBLIC_SUPABASE_URL non configuré — image ignorée.");
    return "";
  }
  return `${STORAGE_BASE}/${bucket}/${path}`;
}

/**
 * Détecte si une URL est une URL Supabase Storage.
 */
export function isSupabaseUrl(url: string): boolean {
  return url.includes("supabase.co/storage") || url.includes("supabase.in/storage");
}

/**
 * Détecte si Supabase est configuré (présence des variables d'environnement).
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
