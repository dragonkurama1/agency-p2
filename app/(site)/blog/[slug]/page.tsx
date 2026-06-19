import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPosts, getBlogPostBySlug } from "@/data/blog";
import { formatDate, slugify } from "@/lib/utils";
import { FaqSection } from "@/components/marketing/faq-section";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { ArticleJsonLd, FaqJsonLd } from "@/components/seo/json-ld";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
  };
}

/** Découpe le contenu en paragraphes et construit une table des matières
 * à partir des phrases qui se terminent par ":" (utilisées comme titres de section). */
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
      <ArticleJsonLd title={post.title} description={post.excerpt} slug={post.slug} datePublished={post.published_at} author={post.author} />
      {post.faq.length > 0 && <FaqJsonLd items={post.faq} />}

      <article className="container-px mx-auto max-w-3xl py-20">
        <Link href="/blog" className="text-sm text-muted-foreground hover:text-[var(--accent-gold)]">
          ← Tous les articles
        </Link>
        <p className="mt-6 text-xs uppercase tracking-wide text-[var(--accent-gold)]">{post.category}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight">{post.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {post.author} · {formatDate(post.published_at)}
        </p>

        {sections.length > 1 && (
          <nav className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-gold)] mb-3">Sommaire</p>
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
          <div className="mt-14">
            <h2 className="font-serif text-2xl mb-6">Questions fréquentes</h2>
            <FaqSection items={post.faq} />
          </div>
        )}
      </article>
      <CtaBanner />
    </>
  );
}
