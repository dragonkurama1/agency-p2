export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
    name: "Prestigia Agency",
    image: "https://www.prestigia-agency.com/og-image.png",
    "@id": "https://www.prestigia-agency.com",
    url: "https://www.prestigia-agency.com",
    telephone: "+212719144144",
    email: "contact@prestigia-agency.com",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bld Qods, The Gold Center, Étage 1, Bureau 2",
      addressLocality: "Casablanca",
      addressRegion: "Ain Chock",
      postalCode: "20470",
      addressCountry: "MA",
    },
    geo: { "@type": "GeoCoordinates", latitude: 33.5731, longitude: -7.5898 },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "10:00", closes: "14:00" },
    ],
    sameAs: [
      "https://instagram.com/prestigia_agency",
      "https://www.linkedin.com/company/prestigia-agency",
      "https://facebook.com/prestigiaagency",
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function ServiceJsonLd({ name, description, slug }: { name: string; description: string; slug: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: name,
    name,
    description,
    provider: { "@type": "Organization", name: "Prestigia Agency", url: "https://www.prestigia-agency.com" },
    areaServed: { "@type": "City", name: "Casablanca" },
    url: `https://www.prestigia-agency.com/services/${slug}`,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function ArticleJsonLd({
  title, description, slug, datePublished, author,
}: { title: string; description: string; slug: string; datePublished: string; author: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished,
    author: { "@type": "Person", name: author },
    publisher: { "@type": "Organization", name: "Prestigia Agency" },
    mainEntityOfPage: `https://www.prestigia-agency.com/blog/${slug}`,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
