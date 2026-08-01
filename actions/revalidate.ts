"use server";

import { revalidateTag } from "next/cache";

const ALL_TAGS = [
  "blog_posts",
  "services",
  "projects",
  "team",
  "partners",
  "testimonials",
  "settings",
  "pages",
  "sections",
  "media",
  "faq",
  "seo_keywords",
  "leads",
  "catalogs",
];

export async function revalidateAllCache(): Promise<{ ok: boolean }> {
  for (const tag of ALL_TAGS) {
    revalidateTag(tag);
  }
  return { ok: true };
}
