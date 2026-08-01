/**
 * Schémas JSON-LD — GEO + E-E-A-T 2026
 *
 * Tous les schémas sont du JSON-LD valide (Schema.org).
 * Ils aident Google, ChatGPT, Perplexity, Claude et Gemini à comprendre
 * précisément le contenu et l'identité de l'agence, favorisant les citations.
 */

import { siteConfig } from "@/lib/site-config";

const BASE_URL = siteConfig.url;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 0) }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Organization + LocalBusiness (layout racine)
// ─────────────────────────────────────────────────────────────────────────────

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness", "ProfessionalService", "MarketingAgency"],
        "@id": `${BASE_URL}/#organization`,
        name: "Prestigia Agency",
        legalName: siteConfig.legalName,
        description:
          "Agence marketing digital à Casablanca spécialisée en SEO, GEO, création de sites web, Google Ads, Meta Ads, branding, réseaux sociaux et stratégie digitale.",
        image: `${BASE_URL}/og-image.png`,
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
        },
        url: BASE_URL,
        telephone: siteConfig.phone,
        email: siteConfig.email,
        priceRange: "$$",
        currenciesAccepted: "MAD",
        paymentAccepted: "Virement bancaire, chèque, carte bancaire",
        address: {
          "@type": "PostalAddress",
          streetAddress: siteConfig.address.street,
          addressLocality: siteConfig.address.city,
          addressRegion: siteConfig.address.district,
          postalCode: siteConfig.address.postalCode,
          addressCountry: siteConfig.address.country,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 33.5731,
          longitude: -7.5898,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "09:00",
            closes: "18:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Saturday"],
            opens: "10:00",
            closes: "14:00",
          },
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: siteConfig.phone,
          contactType: "customer service",
          availableLanguage: ["French", "Arabic", "English"],
          contactOption: "TollFree",
        },
        areaServed: [
          { "@type": "City", name: "Casablanca" },
          { "@type": "Country", name: "Maroc" },
        ],
        knowsAbout: [
          "Marketing Digital",
          "SEO",
          "Generative Engine Optimization",
          "Création de sites web",
          "Google Ads",
          "Meta Ads",
          "Branding",
          "Community Management",
          "Content Marketing",
          "E-commerce",
          "Automatisation Marketing",
          "Intelligence Artificielle appliquée au marketing",
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Services Marketing Digital",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "SEO & Référencement naturel" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Création de site web" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Google Ads & Meta Ads" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Branding & Identité visuelle" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Community Management" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "GEO — Generative Engine Optimization" } },
          ],
        },
        sameAs: [
          siteConfig.social.instagram,
          siteConfig.social.linkedin,
          siteConfig.social.facebook,
        ],
        foundingDate: "2012",
        numberOfEmployees: { "@type": "QuantitativeValue", value: 10 },
      },
      // WebSite schema — active la Search Action (sitelinks searchbox potentiel)
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "Prestigia Agency",
        description: siteConfig.description,
        publisher: { "@id": `${BASE_URL}/#organization` },
        inLanguage: "fr-FR",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/blog?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return <JsonLd data={data} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// WebPage (à utiliser sur chaque page importante)
// ─────────────────────────────────────────────────────────────────────────────

export function WebPageJsonLd({
  title,
  description,
  path,
  breadcrumbs,
}: {
  title: string;
  description: string;
  path: string;
  breadcrumbs?: { name: string; href: string }[];
}) {
  const url = `${BASE_URL}${path}`;
  const data: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: { "@id": `${BASE_URL}/#website` },
      about: { "@id": `${BASE_URL}/#organization` },
      inLanguage: "fr-FR",
      dateModified: new Date().toISOString().split("T")[0],
    },
  ];

  if (breadcrumbs && breadcrumbs.length > 0) {
    data.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Accueil",
          item: BASE_URL,
        },
        ...breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 2,
          name: b.name,
          item: `${BASE_URL}${b.href}`,
        })),
      ],
    });
  }

  return (
    <>
      {data.map((d, i) => (
        <JsonLd key={i} data={d} />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export function ServiceJsonLd({
  name,
  description,
  slug,
}: {
  name: string;
  description: string;
  slug: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${BASE_URL}/services/${slug}#service`,
    serviceType: name,
    name,
    description,
    provider: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Prestigia Agency",
      url: BASE_URL,
    },
    areaServed: [
      { "@type": "City", name: "Casablanca" },
      { "@type": "Country", name: "Maroc" },
    ],
    url: `${BASE_URL}/services/${slug}`,
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/devis`,
      priceCurrency: "MAD",
      availability: "https://schema.org/InStock",
    },
  };
  return <JsonLd data={data} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────

export function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  if (!items.length) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
  return <JsonLd data={data} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Article (blog)
// ─────────────────────────────────────────────────────────────────────────────

export function ArticleJsonLd({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  author,
  coverImage,
}: {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  coverImage?: string;
}) {
  const url = `${BASE_URL}/blog/${slug}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: title,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    url,
    inLanguage: "fr-FR",
    image: coverImage
      ? { "@type": "ImageObject", url: coverImage }
      : { "@type": "ImageObject", url: `${BASE_URL}/og-image.png` },
    author: {
      "@type": "Person",
      name: author,
      worksFor: {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
      },
    },
    publisher: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Prestigia Agency",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/og-image.png`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${url}#webpage` },
    isPartOf: { "@id": `${BASE_URL}/#website` },
    about: { "@id": `${BASE_URL}/#organization` },
  };
  return <JsonLd data={data} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Person (fondateurs)
// ─────────────────────────────────────────────────────────────────────────────

export function PersonJsonLd({
  name,
  role,
  bio,
  linkedin,
  instagram,
  photo,
}: {
  name: string;
  role: string;
  bio?: string;
  linkedin?: string;
  instagram?: string;
  photo?: string;
}) {
  const sameAs = [linkedin, instagram].filter(Boolean) as string[];
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: role,
    description: bio,
    image: photo || `${BASE_URL}/og-image.png`,
    worksFor: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Prestigia Agency",
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
  return <JsonLd data={data} />;
}
