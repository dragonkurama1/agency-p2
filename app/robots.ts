/**
 * robots.ts — stratégie crawlers 2026 (SEO + GEO)
 *
 * Règles :
 * - Crawlers classiques : accès complet au contenu public.
 * - AI Search bots (OAI-SearchBot, PerplexityBot, ClaudeBot-Search) :
 *   autorisés — ils alimentent les citations dans ChatGPT, Perplexity, Claude.
 * - AI Training bots (GPTBot, CCBot, Google-Extended pour l'entraînement) :
 *   bloqués par défaut — ne contribuent pas aux citations de recherche.
 * - Ne jamais bloquer /_next/ : les crawlers ont besoin du CSS/JS pour le rendu.
 *
 * Documentation : https://platform.openai.com/docs/bots
 */

import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Crawlers classiques ─────────────────────────────────────
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/login", "/api/"],
      },

      // ── AI Search (autorisés — génèrent des citations) ──────────
      // OAI-SearchBot = indexation pour ChatGPT Search
      { userAgent: "OAI-SearchBot", allow: "/" },
      // PerplexityBot = indexation pour Perplexity AI
      { userAgent: "PerplexityBot", allow: "/" },
      // Googlebot-Extended = Google AI Overviews / SGE
      { userAgent: "Google-Extended", allow: "/" },
      // Anthropic claudebot (recherche, pas entraînement)
      { userAgent: "ClaudeBot", allow: "/" },

      // ── AI Training (bloqués — n'alimentent pas les citations) ──
      // GPTBot = OpenAI training crawler
      { userAgent: "GPTBot", disallow: "/" },
      // CCBot = Common Crawl (utilisé par de nombreux LLM pour l'entraînement)
      { userAgent: "CCBot", disallow: "/" },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
