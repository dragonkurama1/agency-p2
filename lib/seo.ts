const TITLE_BRAND = "Prestigia Agency";
const TITLE_SUFFIX = ` | ${TITLE_BRAND}`;
const DEFAULT_TITLE_LIMIT = 70;
const DEFAULT_DESCRIPTION_LIMIT = 158;
export const TWITTER_SITE_HANDLE = "@prestigia_agency";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function cleanMetaTitle(title: string, brand = TITLE_BRAND) {
  const original = title.trim();
  if (!original) return original;

  const brandPattern = escapeRegExp(brand);
  const suffixPattern = new RegExp(`\\s*(?:\\|\\s*|—\\s*|-\\s*)${brandPattern}\\s*$`, "i");
  let cleaned = original;

  for (let index = 0; index < 4; index += 1) {
    const next = cleaned.replace(suffixPattern, "").trim();
    if (!next || next === cleaned) break;
    cleaned = next;
  }

  return cleaned || original;
}

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function compactText(value: string, maxLength: number) {
  const normalized = normalizeSpaces(value);
  if (normalized.length <= maxLength) return normalized;

  const room = Math.max(0, maxLength - 3);
  const sliced = normalized.slice(0, room);
  const boundary = sliced.lastIndexOf(" ");
  const compacted = boundary > Math.floor(room * 0.55) ? sliced.slice(0, boundary) : sliced;

  return `${compacted.trim()}...`;
}

export function formatSeoTitle(title: string, maxLength = DEFAULT_TITLE_LIMIT) {
  const cleaned = cleanMetaTitle(normalizeSpaces(title));
  if (!cleaned) return TITLE_BRAND;

  const maxCoreLength = Math.max(12, maxLength - TITLE_SUFFIX.length);
  const core = compactText(cleaned, maxCoreLength);
  const branded = `${core}${TITLE_SUFFIX}`;

  return branded.length <= maxLength ? branded : compactText(branded, maxLength);
}

export function absoluteSeoTitle(title: string, maxLength = DEFAULT_TITLE_LIMIT) {
  return { absolute: formatSeoTitle(title, maxLength) };
}

export function formatMetaDescription(description: string, maxLength = DEFAULT_DESCRIPTION_LIMIT) {
  return compactText(description, maxLength);
}

export function formatHeading(title: string, maxLength = DEFAULT_TITLE_LIMIT) {
  return compactText(cleanMetaTitle(title), maxLength);
}

export function countWords(value: string) {
  const normalized = normalizeSpaces(value);
  if (!normalized) return 0;
  return normalized.split(" ").length;
}

export function seoAlternates(canonical: string) {
  return {
    canonical,
    languages: {
      "fr-MA": canonical,
      fr: canonical,
      "x-default": canonical,
    },
  };
}
