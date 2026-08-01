import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlogPosts, getBlogPostBySlug } from "@/data/blog";
import { formatDate, slugify } from "@/lib/utils";
import { normalizeImageUrl, isVideoUrl } from "@/lib/parse";
import { FaqSection } from "@/components/marketing/faq-section";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { VideoPlayer } from "@/components/marketing/video-player";
import { ArticleJsonLd, FaqJsonLd, WebPageJsonLd } from "@/components/seo/json-ld";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  const metaTitle = post.meta_title || post.title;
  const metaDesc = post.meta_description || post.excerpt;
  return {
    title: metaTitle,
    description: metaDesc,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      type: "article",
      publishedTime: post.published_at,
      authors: [post.author],
      images: post.cover_image
        ? [{ url: normalizeImageUrl(post.cover_image), width: 1200, height: 630, alt: post.title }]
        : [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDesc,
      images: post.cover_image ? [normalizeImageUrl(post.cover_image)] : ["/og-image.png"],
    },
  };
}

/** Découpe le contenu en paragraphes et construit une table des matières. */
function buildSections(content: string) {
  const paragraphs = content.split(/\n+/).filter(Boolean);
  return paragraphs.map((text, i) => ({ id: `${slugify(text.slice(0, 40))}-${i}`, text }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const sections = buildSections(post.content);

  return (
    <>
      <WebPageJsonLd
        title={post.title}
        description={post.excerpt}
        path={`/blog/${slug}`}
        breadcrumbs={[
          { name: "Blog", href: "/blog" },
          { name: post.title, href: `/blog/${slug}` },
        ]}
      />
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt}
        slug={post.slug}
        datePublished={post.published_at}
        author={post.author}
        coverImage={post.cover_image ? normalizeImageUrl(post.cover_image) : undefined}
      />
      {post.faq.length > 0 && <FaqJsonLd items={post.faq} />}

      <article className="container-px mx-auto max-w-3xl py-20">
        <nav aria-label="Fil d'Ariane">
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-[var(--accent-gold)]">
            ← Tous les articles
          </Link>
        </nav>
        <p className="mt-6 text-xs uppercase tracking-wide text-[var(--accent-gold)]">{post.category}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight">{post.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          <span>{post.author}</span>
          <span aria-hidden="true"> · </span>
          <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
        </p>

        {post.cover_image && (
          isVideoUrl(post.cover_image) ? (
            <VideoPlayer src={normalizeImageUrl(post.cover_image)} className="mt-8 aspect-[16/9]" />
          ) : (
            <div className="mt-8 relative w-full aspect-[16/9] rounded-2xl overflow-hidden">
              <Image
                src={normalizeImageUrl(post.cover_image)}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 960px"
                className="object-cover"
                priority
              />
            </div>
          )
        )}

        {sections.length > 1 && (
          <nav
            className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-5"
            aria-label="Sommaire de l'article"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-gold)] mb-3">
              Sommaire
            </p>
            <ol className="space-y-1.5 text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-muted-foreground hover:text-[var(--accent-gold)]">
                    {i + 1}. {s.text.slice(0, 60)}
                    {s.text.length > 60 ? "…" : ""}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="prose mt-10 space-y-5 text-[var(--foreground)]">
          {sections.map((s) => (
            <p key={s.id} id={s.id} className="leading-relaxed">
              {s.text}
            </p>
          ))}
        </div>

        {post.faq.length > 0 && (
          <section className="mt-14" aria-label="Questions fréquentes">
            <h2 className="font-serif text-2xl mb-6">Questions fréquentes</h2>
            <FaqSection items={post.faq} />
          </section>
        )}
      </article>
      <CtaBanner />
    </>
  );
}
