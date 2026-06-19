import { unstable_cache } from "next/cache";
import { isGoogleSheetsConfigured, getSheetRows } from "@/lib/google/sheets";
import { parseJsonSafe } from "@/lib/parse";
import { blogPosts as seedPosts } from "@/lib/seed-data";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string;
  author: string;
  content: string;
  faq: { question: string; answer: string }[];
  status: string;
  published_at: string;
}

function mapRow(row: Record<string, string>): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    tags: row.tags || "",
    author: row.author || "Prestigia Agency",
    content: row.content,
    faq: parseJsonSafe(row.faq_json, []),
    status: row.status || "published",
    published_at: row.published_at,
  };
}

async function fetchPosts(): Promise<BlogPost[]> {
  if (!isGoogleSheetsConfigured()) return seedPosts as BlogPost[];
  try {
    const rows = await getSheetRows<Record<string, string>>("blog_posts");
    const mapped = rows.map(mapRow).filter((p) => p.status === "published");
    return mapped.length ? mapped : (seedPosts as BlogPost[]);
  } catch {
    return seedPosts as BlogPost[];
  }
}

export const getBlogPosts = unstable_cache(fetchPosts, ["blog_posts"], {
  tags: ["blog_posts"],
  revalidate: 3600,
});

export async function getBlogPostBySlug(slug: string) {
  const all = await getBlogPosts();
  return all.find((p) => p.slug === slug);
}

export async function getBlogCategories() {
  const all = await getBlogPosts();
  return Array.from(new Set(all.map((p) => p.category))).filter(Boolean);
}
