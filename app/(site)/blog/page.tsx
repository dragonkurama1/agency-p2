import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { formatDate } from "@/lib/utils";
import { getBlogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Conseils, guides et actualités marketing digital, SEO et branding par Prestigia Agency.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return (
    <section className="container-px mx-auto max-w-5xl py-20">
      <SectionHeading eyebrow="Blog" title="Conseils & guides marketing digital" />
      <div className="mt-12 grid gap-8">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6 sm:p-8 hover:border-[var(--accent-gold)]"
          >
            <p className="text-xs uppercase tracking-wide text-[var(--accent-gold)]">{post.category}</p>
            <h2 className="mt-3 font-serif text-2xl leading-snug">{post.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              {post.author} · {formatDate(post.published_at)}
            </p>
          </Link>
        ))}
        {posts.length === 0 && <p className="text-muted-foreground">Aucun article publié pour le moment.</p>}
      </div>
    </section>
  );
}
