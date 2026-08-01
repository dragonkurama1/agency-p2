export const siteConfig = {
  name: "Prestigia Agency",
  legalName: "Prestigia Agency SARL",
  url: "https://www.prestigia-agency.com",
  description:
    "Prestigia Agency accompagne les marques, PME et entrepreneurs à Casablanca dans leur stratégie digitale, création de contenu, publicité, branding, SEO et développement web.",
  phone: "+212719144144",
  phoneDisplay: "+212 719 144-144",
  email: "contact@prestigia-agency.com",
  whatsapp: "https://wa.me/212719144144",
  address: {
    street: "Bld Qods, The Gold Center, Étage 1, Bureau 2",
    district: "Ain Chock",
    city: "Casablanca",
    country: "MA",
    postalCode: "20470",
  },
  hours: [
    { days: "Lundi - Vendredi", hours: "9h00 - 18h00" },
    { days: "Samedi", hours: "10h00 - 14h00" },
    { days: "Dimanche", hours: "Fermé" },
  ],
  social: {
    instagram: "https://www.instagram.com/prestigia__agency/",
    linkedin: "https://www.linkedin.com/company/prestigiaagency/",
    facebook: "https://www.facebook.com/people/Prestigia-agency/61584253697576/",
  },
  stats: [
    { label: "Projets réalisés", value: "150+" },
    { label: "Clients satisfaits", value: "98%" },
    { label: "Années d'expérience", value: "12+" },
    { label: "Campagnes pilotées", value: "300+" },
  ],
} as const;

export const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Services" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/fondateurs", label: "Fondateurs" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];
