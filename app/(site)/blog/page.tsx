import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { BlogList } from "@/components/marketing/blog-list";
import { getBlogPosts, getBlogCategories } from "@/data/blog";
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
  const [posts, categories, hero] = await Promise.all([
    getBlogPosts(),
    getBlogCategories(),
    getSectionByKey("blog", "hero"),
  ]);

  return (
    <>
      <WebPageJsonLd
        title="Blog — Prestigia Agency"
        description="Articles sur le marketing digital, SEO, GEO et branding par Prestigia Agency à Casablanca."
        path="/blog"
        breadcrumbs={[{ name: "Blog", href: "/blog" }]}
      />
      <section
        className="container-px mx-auto max-w-5xl py-16 sm:py-20"
        aria-label="Articles du blog"
      >
        <SectionHeading
          as="h1"
          eyebrow="Blog"
          title={hero?.title || "Conseils marketing digital, SEO et contenu"}
          subtitle={
            hero?.subtitle ||
            "Guides pratiques pour mieux comprendre la visibilité locale, la création de contenu, la publicité et la conversion digitale au Maroc."
          }
        />
        <h2 className="mt-12 font-serif text-2xl text-white">Tous les articles</h2>
        <BlogList posts={posts} categories={categories} />
      </section>
    </>
  );
}
