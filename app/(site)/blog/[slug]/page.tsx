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

// ─── Markdown renderer ────────────────────────────────────────────────────────

/** Extrait les titres ## pour le sommaire */
function buildToc(content: string) {
  return content
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => {
      const heading = line.slice(3).trim();
      return { id: slugify(heading.slice(0, 50)), heading };
    });
}

/** Rendu inline : **gras**, *italique*, `code` */
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} className="bg-[var(--muted)] px-1.5 py-0.5 rounded text-sm font-mono">
          {part.slice(1, -1)}
        </code>
      );
    return part;
  });
}

/** Convertit le contenu markdown en JSX */
function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  const listItems: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let key = 0;

  function flushList() {
    if (!listItems.length) return;
    if (listType === "ul") {
      nodes.push(
        <ul key={key++} className="list-disc list-inside space-y-1.5 my-5 pl-2 text-[var(--muted-foreground)]">
          {listItems.map((item, j) => (
            <li key={j} className="leading-relaxed">{renderInline(item)}</li>
          ))}
        </ul>
      );
    } else {
      nodes.push(
        <ol key={key++} className="list-decimal list-inside space-y-1.5 my-5 pl-2 text-[var(--muted-foreground)]">
          {listItems.map((item, j) => (
            <li key={j} className="leading-relaxed">{renderInline(item)}</li>
          ))}
        </ol>
      );
    }
    listItems.length = 0;
    listType = null;
  }

  for (const line of lines) {
    if (line.startsWith("## ")) {
      flushList();
      const text = line.slice(3).trim();
      nodes.push(
        <h2
          key={key++}
          id={slugify(text.slice(0, 50))}
          className="font-serif text-2xl sm:text-3xl mt-12 mb-4 scroll-mt-24 text-[var(--foreground)]"
        >
          {text}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      flushList();
      const text = line.slice(4).trim();
      nodes.push(
        <h3 key={key++} className="font-serif text-xl mt-8 mb-3 text-[var(--foreground)]">
          {text}
        </h3>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (listType !== "ul") { flushList(); listType = "ul"; }
      listItems.push(line.slice(2));
    } else if (/^\d+\.\s/.test(line)) {
      if (listType !== "ol") { flushList(); listType = "ol"; }
      listItems.push(line.replace(/^\d+\.\s/, ""));
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      nodes.push(
        <p key={key++} className="leading-relaxed text-[var(--muted-foreground)]">
          {renderInline(line.trim())}
        </p>
      );
    }
  }
  flushList();
  return nodes;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const toc = buildToc(post.content);

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
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane">
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-[var(--accent-gold)]">
            ← Tous les articles
          </Link>
        </nav>

        {/* En-tête */}
        <p className="mt-6 text-xs uppercase tracking-wide text-[var(--accent-gold-text)]">{post.category}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight">{post.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          <span>{post.author}</span>
          <span aria-hidden="true"> · </span>
          <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
        </p>

        {/* Image de couverture */}
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

        {/* Sommaire — seulement les titres ## */}
        {toc.length > 0 && (
          <nav
            className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-5"
            aria-label="Sommaire de l'article"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-gold-text)] mb-3">
              Sommaire
            </p>
            <ul className="space-y-1.5 text-sm list-none p-0">
              {toc.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-muted-foreground hover:text-[var(--accent-gold)] transition-colors"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Contenu rendu en markdown */}
        <div className="mt-10 space-y-2">
          {renderMarkdown(post.content)}
        </div>

        {/* FAQ */}
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
