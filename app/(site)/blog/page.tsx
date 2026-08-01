import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { formatDate } from "@/lib/utils";
import { getBlogPosts } from "@/data/blog";
import { getSectionByKey } from "@/data/sections";
import { getPageMeta } from "@/data/pages";
import { WebPageJsonLd } from "@/components/seo/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMeta("blog", {
    title: "Blog",
    description:
      "Conseils, guides et actualités marketing digital, SEO, GEO et branding par Prestigia Agency à Casablanca.",
    ogTitle: "Blog Marketing Digital — Prestigia Agency",
  });
}

export default async function BlogPage() {
  const [posts, hero] = await Promise.all([getBlogPosts(), getSectionByKey("blog", "hero")]);
  return (
    <>
      <WebPageJsonLd
        title="Blog — Prestigia Agency"
        description="Articles sur le marketing digital, SEO, GEO et branding par Prestigia Agency à Casablanca."
        path="/blog"
        breadcrumbs={[{ name: "Blog", href: "/blog" }]}
      />
      <section className="container-px mx-auto max-w-5xl py-20" aria-label="Articles du blog">
        <SectionHeading eyebrow="Blog" title={hero?.title || "Conseils & guides marketing digital"} subtitle={hero?.subtitle || undefined} />
        <ul className="mt-12 grid gap-8 list-none p-0" aria-label="Liste des articles">
          {posts.map((post) => (
            <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group block rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6 sm:p-8 hover:border-[var(--accent-gold)]"
            >
              <p className="text-xs uppercase tracking-wide text-[var(--accent-gold)]">{post.category}</p>
              <h2 className="mt-3 font-serif text-2xl leading-snug">{post.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                <span>{post.author}</span>
                <span aria-hidden="true"> · </span>
                <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
              </p>
            </Link>
            </li>
          ))}
          {posts.length === 0 && (
            <li><p className="text-muted-foreground">Aucun article publié pour le moment.</p></li>
          )}
        </ul>
      </section>
    </>
  );
}
