/** Petits utilitaires pour convertir les valeurs texte issues de Supabase. */

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|avi|mkv|m4v)(\?.*)?$/i;

/** Retourne true si l'URL pointe vers un fichier vidéo. */
export function isVideoUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return VIDEO_EXTENSIONS.test(url);
}

export function parseBool(value: unknown, fallback = true): boolean {
  if (value === undefined || value === null || value === "") return fallback;
  const v = String(value).trim().toLowerCase();
  return v === "true" || v === "1" || v === "oui" || v === "yes";
}

export function parseNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function parseJsonSafe<T>(value: unknown, fallback: T): T {
  if (!value || typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function sortByOrder<T extends { order?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * Normalise n'importe quelle URL image vers un format directement affichable.
 *
 * Cas gérés :
 *  1. Lien de partage Google Drive (/file/d/ID/view) → URL directe uc?export=view
 *  2. Lien Drive /open?id=ID → URL directe uc?export=view
 *  3. URL Supabase Storage → renvoyée telle quelle (déjà publique)
 *  4. Toute autre URL → renvoyée telle quelle
 */
export function normalizeImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Supabase Storage — déjà une URL directe
  if (trimmed.includes("supabase.co/storage") || trimmed.includes("supabase.in/storage")) {
    return trimmed;
  }

  // Drive /file/d/ID/view?usp=sharing
  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;

  // Drive /open?id=ID
  const openMatch = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;

  return trimmed;
}

export function shouldBypassImageOptimization(url: string | undefined | null): boolean {
  const normalized = normalizeImageUrl(url);
  return normalized.includes("supabase.co/storage") || normalized.includes("supabase.in/storage");
}
