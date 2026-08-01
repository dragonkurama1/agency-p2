import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // ── Turbopack root (évite la confusion avec le package-lock.json parent) ────
  turbopack: {
    root: path.resolve(__dirname),
  },

  // ── Images autorisées ──────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      // Google Drive (liens directs uc?export=view)
      { protocol: "https", hostname: "drive.google.com" },
      // Google CDN (lh3 — utilisé par Drive après redirection)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Supabase Storage (remplacer "votre-projet" par votre project ref)
      // Format : https://<ref>.supabase.co/storage/v1/object/public/...
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
    // Formats modernes prioritaires — réduit la taille de 30-50 %
    formats: ["image/avif", "image/webp"],
    // Limites de taille adaptées au contenu de l'agence
    minimumCacheTTL: 86400, // 24h de cache CDN pour les images optimisées
  },

  // ── Headers HTTP ───────────────────────────────────────────────────────────
  // Sécurité, performance, SEO
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Empêche le clickjacking
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Empêche le MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Referrer policy : envoie l'URL complète en HTTPS, domain only en cross-origin
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions Policy : restreint les APIs sensibles non utilisées
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // HSTS : force HTTPS pour 1 an (à activer une fois le domaine stable)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
      // Cache long pour les assets statiques Next.js (hachés — safe)
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Cache pour les images optimisées
      {
        source: "/_next/image(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },

  // ── Redirections ───────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Exemples : décommenter si nécessaire
      // { source: "/services-old", destination: "/services", permanent: true },
    ];
  },

  // ── Server Actions ────────────────────────────────────────────────────────
  // Limite par défaut = 1 Mo, insuffisant pour les uploads d'images
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },

  // ── Compression ────────────────────────────────────────────────────────────
  compress: true,

  // ── TypeScript strict ──────────────────────────────────────────────────────
  // typescript: { ignoreBuildErrors: false }, // par défaut en mode strict
};

export default nextConfig;
