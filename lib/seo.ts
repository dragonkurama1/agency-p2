const TITLE_BRAND = "Prestigia Agency";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function cleanMetaTitle(title: string, brand = TITLE_BRAND) {
  const original = title.trim();
  if (!original) return original;

  const brandPattern = escapeRegExp(brand);
  const suffixPattern = new RegExp(`\\s*(?:\\|\\s*|—\\s*|-\\s*)${brandPattern}\\s*$`, "i");
  let cleaned = original;

  for (let index = 0; index < 2; index += 1) {
    const next = cleaned.replace(suffixPattern, "").trim();
    if (!next || next === cleaned) break;
    cleaned = next;
  }

  return cleaned || original;
}
