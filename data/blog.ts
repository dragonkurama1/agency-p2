import { unstable_cache } from "next/cache";
import { getSupabaseClient } from "@/lib/supabase";
import { parseJsonSafe } from "@/lib/parse";
import { blogPosts as seedPosts } from "@/lib/seed-data";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  category: string;
  tags: string;
  author: string;
  content: string;
  faq: { question: string; answer: string }[];
  status: string;
  published_at: string;
  meta_title: string;
  meta_description: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: Record<string, any>): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || "",
    cover_image: row.cover_image || "",
    category: row.category || "",
    tags: row.tags || "",
    author: row.author || "Prestigia Agency",
    content: row.content || "",
    faq: Array.isArray(row.faq_json) ? row.faq_json : parseJsonSafe(row.faq_json, []),
    status: row.status || "published",
    published_at: row.published_at || "",
    meta_title: row.meta_title || "",
    meta_description: row.meta_description || "",
  };
}

async function fetchPosts(): Promise<BlogPost[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error) throw error;
    const mapped = (data ?? []).map(mapRow);
    return mapped.length ? mapped : (seedPosts as BlogPost[]);
  } catch {
    return seedPosts as BlogPost[];
  }
}

export const getBlogPosts = unstable_cache(fetchPosts, ["blog_posts", "service-cta-v1"], {
  tags: ["blog_posts"],
  revalidate: 60,
});

export async function getBlogPostBySlug(slug: string) {
  const all = await getBlogPosts();
  return all.find((p) => p.slug === slug);
}

export async function getBlogCategories() {
  const all = await getBlogPosts();
  return Array.from(new Set(all.map((p) => p.category))).filter(Boolean);
}
