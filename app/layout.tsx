import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { siteConfig } from "@/lib/site-config";

// ── Polices ───────────────────────────────────────────────────────────────────
// display: "swap" garantit un texte lisible pendant le chargement (LCP / CLS).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

// ── Viewport (séparé de metadata — obligatoire Next.js App Router) ────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
    { media: "(prefers-color-scheme: light)", color: "#f7f5f1" },
  ],
};

// ── Métadonnées globales ──────────────────────────────────────────────────────
export const metadata: Metadata = {
  // Résolution des URLs relatives (canonical, og:image, etc.)
  metadataBase: new URL(siteConfig.url),

  title: {
    default: "Prestigia Agency — Agence Marketing Digital à Casablanca",
    template: "%s | Prestigia Agency",
  },
  description: siteConfig.description,

  keywords: [
    "agence marketing digital Casablanca",
    "agence digitale Maroc",
    "agence SEO Casablanca",
    "création site web Casablanca",
    "branding Casablanca",
    "Google Ads Maroc",
    "Meta Ads Maroc",
    "GEO Generative Engine Optimization",
    "community management Casablanca",
    "stratégie digitale Maroc",
  ],

  authors: [{ name: "Prestigia Agency", url: siteConfig.url }],
  creator: "Prestigia Agency",
  publisher: "Prestigia Agency",

  alternates: {
    canonical: "/",
    languages: { "fr-FR": "/" },
  },

  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Prestigia Agency — Agence Marketing Digital à Casablanca",
    description: siteConfig.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prestigia Agency — Agence Marketing Digital à Casablanca",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Prestigia Agency — Agence Marketing Digital à Casablanca",
    description: siteConfig.description,
    images: ["/og-image.png"],
    creator: "@prestigia_agency",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  // Verification Search Console (à renseigner après configuration)
  // verification: { google: "VOTRE_CODE_VERIFICATION" },

  category: "marketing",
};

// ── Root Layout ───────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        {/* next/font auto-héberge les polices — pas besoin de préconnexions Google Fonts */}
        {/* DNS prefetch pour GA4 (chargé après hydratation) */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Données structurées globales : Organization + WebSite */}
        <OrganizationJsonLd />
        {children}
        {/* GA4 — chargé après hydratation, production uniquement */}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
