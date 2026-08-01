"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { normalizeImageUrl } from "@/lib/parse";
import type { BlogPost } from "@/data/blog";

export function BlogList({
  posts,
  categories,
}: {
  posts: BlogPost[];
  categories: string[];
}) {
  const [active, setActive] = useState("Tous");

  const filtered = useMemo(
    () => (active === "Tous" ? posts : posts.filter((p) => p.category === active)),
    [posts, active]
  );

  return (
    <>
      {/* ── Filtres catégories ── */}
      {categories.length > 0 && (
        <div
          className="mt-10 flex flex-wrap gap-2"
          role="group"
          aria-label="Filtrer par catégorie"
        >
          {["Tous", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              aria-pressed={active === cat}
              className={[
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                active === cat
                  ? "bg-[var(--accent-gold)] text-white shadow-sm"
                  : "border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]",
              ].join(" ")}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ── Liste articles ── */}
      <ul className="mt-8 grid gap-6 list-none p-0 sm:grid-cols-2">
        {filtered.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex flex-col h-full rounded-2xl border border-[var(--border)] bg-[var(--muted)] overflow-hidden hover:border-[var(--accent-gold)] transition-colors duration-200"
            >
              {/* Image de couverture */}
              {post.cover_image ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    src={normalizeImageUrl(post.cover_image)}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] bg-[linear-gradient(135deg,var(--border),var(--muted))]" aria-hidden="true" />
              )}

              <div className="flex flex-col flex-1 p-6">
                <p className="text-xs uppercase tracking-wide text-[var(--accent-gold)]">
                  {post.category}
                </p>
                <h2 className="mt-2 font-serif text-xl leading-snug flex-1">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  <span>{post.author}</span>
                  <span aria-hidden="true"> · </span>
                  <time dateTime={post.published_at}>
                    {formatDate(post.published_at)}
                  </time>
                </p>
              </div>
            </Link>
          </li>
        ))}

        {filtered.length === 0 && (
          <li className="col-span-2">
            <p className="text-muted-foreground text-center py-10">
              Aucun article dans cette catégorie.
            </p>
          </li>
        )}
      </ul>
    </>
  );
}
