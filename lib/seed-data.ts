/**
 * Données de démonstration utilisées quand Google Sheets n'est pas encore
 * configuré (voir lib/google/sheets.ts -> isGoogleSheetsConfigured()).
 * Permet de lancer `npm run dev` immédiatement et de visualiser le site fini.
 * Une fois le Google Sheet créé (mêmes colonnes que lib/entities.ts), ces
 * données peuvent y être copiées comme point de départ.
 */

export interface Service {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  full_description: string;
  icon: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  advantages: string[];
  process: string[];
  faq: { question: string; answer: string }[];
  related: string[];
  order: number;
  active: boolean;
}

export const services: Service[] = [
  {
    id: "srv-1",
    slug: "creation-site-web-casablanca",
    title: "Création de site web à Casablanca",
    short_description: "Sites vitrines et e-commerce rapides, modernes, pensés pour convertir.",
    full_description:
      "Nous concevons des sites web sur-mesure pour les PME et marques marocaines : architecture claire, design premium, performance technique et structure SEO dès la conception. Chaque site est pensé comme un outil commercial, pas seulement une vitrine.",
    icon: "Code2",
    meta_title: "Création de site web à Casablanca | Prestigia Agency",
    meta_description: "Agence de création de site web à Casablanca : sites vitrines et e-commerce rapides, modernes et optimisés pour la conversion et le référencement.",
    keywords: "création site web Casablanca, création site web Maroc, développement site e-commerce Maroc",
    advantages: ["Design premium sur-mesure", "Performance et Core Web Vitals optimisés", "Structure SEO intégrée dès le départ", "Formation à la prise en main"],
    process: ["Audit & cahier des charges", "Maquettage UX/UI", "Développement & intégration", "Mise en ligne & suivi"],
    faq: [
      { question: "Combien de temps pour créer mon site ?", answer: "Comptez 3 à 6 semaines selon la complexité, de l'audit à la mise en ligne." },
      { question: "Le site sera-t-il optimisé pour le SEO ?", answer: "Oui, la structure technique SEO (metadata, vitesse, balisage) est intégrée dès la conception, pas ajoutée après coup." },
    ],
    related: ["seo-referencement-naturel-maroc", "branding-identite-visuelle"],
    order: 1,
    active: true,
  },
  {
    id: "srv-2",
    slug: "seo-referencement-naturel-maroc",
    title: "SEO & référencement naturel au Maroc",
    short_description: "Une visibilité durable sur Google, sans dépendre de la publicité.",
    full_description:
      "Notre approche SEO combine audit technique, stratégie de contenu et autorité de domaine pour positionner durablement votre site sur les recherches qui comptent pour votre activité, à Casablanca et au Maroc.",
    icon: "TrendingUp",
    meta_title: "Agence SEO Casablanca — Référencement naturel Maroc | Prestigia Agency",
    meta_description: "Consultant SEO à Casablanca : audit technique, stratégie de mots-clés et contenu pour améliorer durablement votre référencement naturel au Maroc.",
    keywords: "agence SEO Casablanca, référencement naturel Maroc, consultant SEO Casablanca",
    advantages: ["Audit technique complet", "Stratégie de mots-clés locale et nationale", "Contenu optimisé sans keyword stuffing", "Reporting mensuel transparent"],
    process: ["Audit SEO initial", "Stratégie de mots-clés", "Optimisation technique & contenu", "Suivi des positions & ajustements"],
    faq: [
      { question: "En combien de temps voit-on des résultats SEO ?", answer: "Les premiers signaux apparaissent en 2-3 mois, les résultats significatifs en 6 mois selon la concurrence du secteur." },
    ],
    related: ["creation-site-web-casablanca", "strategie-digitale-pme-maroc"],
    order: 2,
    active: true,
  },
  {
    id: "srv-3",
    slug: "google-ads-meta-ads-maroc",
    title: "Google Ads & Meta Ads au Maroc",
    short_description: "Des campagnes publicitaires pilotées par la donnée, pas par l'intuition.",
    full_description:
      "Nous gérons vos campagnes Google Ads, Facebook et Instagram Ads avec un objectif clair : un coût d'acquisition maîtrisé et des leads qualifiés. Ciblage précis, créatifs testés, optimisation continue.",
    icon: "Megaphone",
    meta_title: "Agence Google Ads & Meta Ads Casablanca | Prestigia Agency",
    meta_description: "Gestion de campagnes Google Ads et Meta Ads au Maroc : ciblage précis, créatifs performants, suivi du ROAS et optimisation continue.",
    keywords: "Google Ads Casablanca, publicité Facebook Instagram Maroc",
    advantages: ["Ciblage par audience et lookalike", "Création de visuels et copywriting publicitaire", "Suivi du ROAS en temps réel", "Tests A/B continus"],
    process: ["Définition des objectifs & budget", "Setup tracking & pixels", "Lancement & optimisation", "Reporting de performance"],
    faq: [
      { question: "Quel budget minimum pour démarrer ?", answer: "Nous adaptons la stratégie à votre budget ; un test initial est possible à partir de quelques milliers de dirhams par mois." },
    ],
    related: ["community-management-casablanca", "creation-contenu-photo-video"],
    order: 3,
    active: true,
  },
  {
    id: "srv-4",
    slug: "community-management-casablanca",
    title: "Community management à Casablanca",
    short_description: "Une présence sociale cohérente qui engage votre audience.",
    full_description:
      "Stratégie de contenu, planning éditorial, création de visuels et animation des communautés Instagram, Facebook, LinkedIn et TikTok pour construire une marque reconnue et engager une audience qualifiée.",
    icon: "Share2",
    meta_title: "Agence Social Media & Community Management Casablanca | Prestigia Agency",
    meta_description: "Community management à Casablanca : stratégie de contenu, création de visuels et animation de vos réseaux sociaux pour engager votre audience.",
    keywords: "community management Casablanca, agence social media Casablanca",
    advantages: ["Calendrier éditorial sur-mesure", "Création graphique cohérente avec votre branding", "Modération et relation communauté", "Reporting d'engagement"],
    process: ["Audit des réseaux existants", "Ligne éditoriale & charte", "Production de contenu", "Publication & animation"],
    faq: [
      { question: "Sur quels réseaux travaillez-vous ?", answer: "Instagram, Facebook, LinkedIn et TikTok selon votre audience cible." },
    ],
    related: ["creation-contenu-photo-video", "google-ads-meta-ads-maroc"],
    order: 4,
    active: true,
  },
  {
    id: "srv-5",
    slug: "creation-contenu-photo-video",
    title: "Création de contenu photo & vidéo",
    short_description: "Du contenu qui capte l'attention et raconte votre marque.",
    full_description:
      "Shootings produits, vidéos de marque, UGC, motion design et vidéos assistées par IA : nous produisons le contenu visuel qui alimente vos réseaux sociaux, votre site et vos campagnes publicitaires.",
    icon: "Camera",
    meta_title: "Création de contenu photo & vidéo à Casablanca | Prestigia Agency",
    meta_description: "Production de contenu photo, vidéo, UGC et motion design à Casablanca pour alimenter vos réseaux sociaux et campagnes publicitaires.",
    keywords: "création contenu vidéo Casablanca, UGC, motion design",
    advantages: ["Shootings produits et corporate", "Vidéos courtes optimisées réseaux sociaux", "UGC et motion design", "Vidéos assistées par IA"],
    process: ["Brief créatif", "Scénarisation & shooting", "Montage & post-production", "Livraison multi-format"],
    faq: [
      { question: "Fournissez-vous le matériel de shooting ?", answer: "Oui, équipe et matériel professionnel inclus, sur site ou en studio." },
    ],
    related: ["community-management-casablanca", "branding-identite-visuelle"],
    order: 5,
    active: true,
  },
  {
    id: "srv-6",
    slug: "branding-identite-visuelle",
    title: "Branding & identité visuelle",
    short_description: "Une identité de marque forte, cohérente sur tous les points de contact.",
    full_description:
      "Logo, charte graphique, ton de voix, supports de communication : nous construisons une identité de marque mémorable qui inspire confiance et différencie votre entreprise sur son marché.",
    icon: "Sparkles",
    meta_title: "Agence Branding & Identité Visuelle Casablanca | Prestigia Agency",
    meta_description: "Création de logo, charte graphique et identité de marque à Casablanca pour une présence cohérente et mémorable sur tous vos supports.",
    keywords: "branding Casablanca",
    advantages: ["Logo et système graphique complet", "Charte de marque détaillée", "Ton de voix et messaging", "Déclinaison sur tous les supports"],
    process: ["Découverte de marque", "Recherche & exploration créative", "Création de l'identité", "Livraison de la charte graphique"],
    faq: [
      { question: "Le branding inclut-il le packaging ?", answer: "Oui si nécessaire, le packaging et les supports physiques peuvent être inclus sur devis." },
    ],
    related: ["creation-site-web-casablanca", "creation-contenu-photo-video"],
    order: 6,
    active: true,
  },
  {
    id: "srv-7",
    slug: "automatisation-whatsapp-crm",
    title: "Automatisation WhatsApp, CRM & leads",
    short_description: "Ne perdez plus aucun lead : réponse instantanée et suivi automatisé.",
    full_description:
      "Mise en place de chatbots WhatsApp, intégration CRM et workflows d'automatisation pour qualifier, relancer et convertir vos leads sans effort manuel supplémentaire.",
    icon: "Workflow",
    meta_title: "Automatisation WhatsApp & CRM Maroc | Prestigia Agency",
    meta_description: "Automatisation WhatsApp, intégration CRM et génération de leads au Maroc pour qualifier et convertir vos prospects automatiquement.",
    keywords: "automatisation WhatsApp Maroc, génération de leads Maroc",
    advantages: ["Chatbot WhatsApp Business API", "Intégration CRM (HubSpot, Pipedrive...)", "Scénarios de relance automatique", "Suivi du pipeline commercial"],
    process: ["Cartographie du parcours client", "Configuration des outils", "Tests & mise en production", "Formation de l'équipe"],
    faq: [
      { question: "Faut-il un numéro WhatsApp Business dédié ?", answer: "Oui, nous vous accompagnons dans sa configuration si vous n'en avez pas encore." },
    ],
    related: ["strategie-digitale-pme-maroc", "google-ads-meta-ads-maroc"],
    order: 7,
    active: true,
  },
  {
    id: "srv-8",
    slug: "strategie-digitale-pme-maroc",
    title: "Stratégie digitale pour PME marocaines",
    short_description: "Un plan d'action clair, priorisé selon vos objectifs et votre budget.",
    full_description:
      "Nous accompagnons les PME marocaines dans la construction d'une feuille de route digitale complète : positionnement, choix des canaux, priorisation des actions et pilotage des résultats.",
    icon: "Compass",
    meta_title: "Stratégie Digitale pour PME au Maroc | Prestigia Agency",
    meta_description: "Accompagnement stratégique digital pour PME marocaines : positionnement, choix des canaux et plan d'action priorisé selon vos objectifs.",
    keywords: "marketing digital PME Maroc, stratégie digitale entreprise",
    advantages: ["Diagnostic 360° de votre présence digitale", "Plan d'action priorisé et réaliste", "Pilotage mensuel des résultats", "Accompagnement sur la durée"],
    process: ["Audit & diagnostic", "Définition des objectifs", "Plan d'action", "Pilotage & ajustements"],
    faq: [
      { question: "Travaillez-vous avec des entrepreneurs individuels ?", answer: "Oui, notre accompagnement s'adapte aussi bien aux PME qu'aux indépendants et marques en croissance." },
    ],
    related: ["seo-referencement-naturel-maroc", "automatisation-whatsapp-crm"],
    order: 8,
    active: true,
  },
  {
    id: "srv-9",
    slug: "agence-marketing-digital-casablanca",
    title: "Agence marketing digital à Casablanca",
    short_description: "Stratégie, contenu, publicité, web et data réunis dans une seule équipe.",
    full_description:
      "Prestigia Agency est votre partenaire marketing digital à Casablanca : nous combinons stratégie, création, publicité et développement web dans une approche orientée résultats, pour les marques et PME qui veulent grandir.",
    icon: "LayoutGrid",
    meta_title: "Agence Marketing Digital à Casablanca | Prestigia Agency",
    meta_description: "Agence marketing digital à Casablanca : stratégie, contenu, publicité, web et data réunis pour faire grandir votre entreprise.",
    keywords: "agence marketing digital Casablanca, agence digitale Casablanca, agence communication digitale Casablanca",
    advantages: ["Une équipe pluridisciplinaire", "Une stratégie unifiée tous canaux", "Des résultats mesurables", "Un interlocuteur unique"],
    process: ["Audit", "Stratégie", "Création", "Croissance"],
    faq: [
      { question: "Travaillez-vous uniquement avec des entreprises à Casablanca ?", answer: "Nous accompagnons des clients partout au Maroc, avec une présence forte à Casablanca." },
    ],
    related: ["seo-referencement-naturel-maroc", "creation-site-web-casablanca"],
    order: 9,
    active: true,
  },
  {
    id: "srv-10",
    slug: "marketing-strategique",
    title: "Marketing stratégique",
    short_description: "Des décisions marketing fondées sur la donnée, pas sur l'intuition.",
    full_description:
      "Études de marché, positionnement, analyse concurrentielle et plans marketing : nous posons les fondations stratégiques sur lesquelles construire des actions digitales cohérentes et efficaces.",
    icon: "BarChart3",
    meta_title: "Marketing Stratégique Maroc | Prestigia Agency",
    meta_description: "Stratégie marketing fondée sur la donnée : positionnement, étude de marché et plan d'action pour les marques et entreprises au Maroc.",
    keywords: "marketing stratégique digital",
    advantages: ["Analyse de marché et concurrence", "Positionnement de marque clair", "Plan marketing actionnable", "Indicateurs de pilotage définis"],
    process: ["Recherche & analyse", "Positionnement", "Plan stratégique", "Mise en œuvre accompagnée"],
    faq: [
      { question: "Cette prestation peut-elle précéder une refonte de site ou de branding ?", answer: "Oui, c'est même recommandé : la stratégie cadre les décisions créatives et digitales qui suivent." },
    ],
    related: ["strategie-digitale-pme-maroc", "branding-identite-visuelle"],
    order: 10,
    active: true,
  },
];

export const team = [
  {
    id: "team-1",
    name: "Abdelkader Naim",
    role: "Co-Founder & Développeur Informatique",
    bio: "Développement web & architecture. 5 ans d'expérience à construire des produits digitaux performants pour des marques marocaines.",
    photo_url: "",
    linkedin: "",
    instagram: "",
    order: 1,
    active: true,
  },
  {
    id: "team-2",
    name: "Ahmed Ghiwane",
    role: "Co-Founder & Expert Digital",
    bio: "Shooting, stratégie digitale & performance. 6 ans d'expérience à piloter des campagnes qui transforment la visibilité en clients réels.",
    photo_url: "",
    linkedin: "",
    instagram: "",
    order: 2,
    active: true,
  },
];

export const partners = [
  { id: "p-1", name: "Smetec", website: "", description: "Aménagement sportif — conception et aménagement d'espaces sportifs.", logo_url: "", order: 1, active: true },
  { id: "p-2", name: "Arena Ville Verte", website: "", description: "Location de terrains multisports (Foot, Padel, Basket).", logo_url: "", order: 2, active: true },
  { id: "p-3", name: "Barça Academy Maroc", website: "", description: "Académie de football — centre de formation pour jeunes talents.", logo_url: "", order: 3, active: true },
  { id: "p-4", name: "Platima", website: "", description: "Matériaux de construction — acteur clé du BTP.", logo_url: "", order: 4, active: true },
];

export const testimonials = [
  {
    id: "t-1",
    client_name: "Ahmed Ghiwane",
    company: "Prestigia Agency",
    message: "Le marketing digital n'est pas une dépense, c'est un investissement stratégique qui transforme les entreprises en champions de leur secteur.",
    rating: 5,
    service: "Marketing Stratégique",
    active: true,
  },
  {
    id: "t-2",
    client_name: "Responsable Marketing",
    company: "Arena Ville Verte",
    message: "Une équipe réactive qui a structuré notre présence digitale et augmenté nos réservations en ligne en quelques mois.",
    rating: 5,
    service: "Community Management",
    active: true,
  },
  {
    id: "t-3",
    client_name: "Direction Commerciale",
    company: "Platima",
    message: "Un site web professionnel et un référencement qui génère désormais des demandes qualifiées chaque semaine.",
    rating: 5,
    service: "Développement Web & SEO",
    active: true,
  },
];

export const processSteps = [
  { step: "01", title: "Audit", description: "Analyse complète de votre présence digitale actuelle, de votre marché et de vos concurrents." },
  { step: "02", title: "Stratégie", description: "Définition d'objectifs clairs et d'un plan d'action priorisé selon votre budget et vos délais." },
  { step: "03", title: "Création", description: "Production des contenus, du design et des campagnes qui mettent la stratégie en œuvre." },
  { step: "04", title: "Croissance", description: "Pilotage continu, optimisation des résultats et ajustement de la stratégie dans le temps." },
];

export const homeFaq = [
  { question: "Quels types d'entreprises accompagnez-vous ?", answer: "Des PME, marques et entrepreneurs à Casablanca et partout au Maroc, dans des secteurs variés : sport, BTP, retail, services." },
  { question: "Combien de temps avant de voir des résultats ?", answer: "Cela dépend du service : la publicité génère des résultats en quelques jours, le SEO en quelques mois. Nous fixons des attentes réalistes dès le départ." },
  { question: "Proposez-vous des forfaits mensuels ?", answer: "Oui, la plupart de nos prestations (SEO, social media, ads) fonctionnent en accompagnement mensuel avec engagement minimal." },
  { question: "Puis-je vous confier uniquement la création de mon site, sans accompagnement marketing ?", answer: "Bien sûr, chaque service est disponible indépendamment ou combiné dans une stratégie globale." },
];

export const projects = [
  {
    id: "proj-1",
    slug: "arena-ville-verte-refonte-digitale",
    title: "Refonte digitale — Arena Ville Verte",
    client_name: "Arena Ville Verte",
    category: "Site Web",
    sector: "Sport & loisirs",
    objective: "Digitaliser les réservations de terrains et renforcer la visibilité locale.",
    solution: "Nouveau site de réservation en ligne, SEO local et stratégie social media.",
    results: "+65% de réservations en ligne en 4 mois, présence Google Maps optimisée.",
    cover_image: "",
    active: true,
  },
  {
    id: "proj-2",
    slug: "platima-generation-de-leads",
    title: "Génération de leads B2B — Platima",
    client_name: "Platima",
    category: "SEO",
    sector: "BTP & matériaux de construction",
    objective: "Générer des demandes de devis qualifiées via le référencement naturel.",
    solution: "Refonte SEO du site, contenu spécialisé BTP, maillage interne.",
    results: "x3 demandes de devis entrantes en 6 mois.",
    cover_image: "",
    active: true,
  },
  {
    id: "proj-3",
    slug: "barca-academy-maroc-branding",
    title: "Identité de marque — Barça Academy Maroc",
    client_name: "Barça Academy Maroc",
    category: "Branding",
    sector: "Formation sportive",
    objective: "Créer une identité visuelle alignée avec un standard international.",
    solution: "Charte graphique complète, supports de communication, contenu photo/vidéo.",
    results: "Identité déployée sur tous les supports en 6 semaines.",
    cover_image: "",
    active: true,
  },
];

export const blogPosts = [
  {
    id: "blog-1",
    slug: "comment-choisir-agence-marketing-digital",
    title: "Comment choisir une agence marketing digital — checklist complète",
    excerpt: "Guide complet pour sélectionner la meilleure agence marketing digital adaptée à votre entreprise.",
    category: "Marketing Digital",
    tags: "Marketing Digital,Agence",
    author: "Ahmed Ghiwane",
    content:
      "Choisir une agence marketing digital est une décision stratégique. Voici les critères essentiels : expertise sectorielle, transparence des résultats, méthodologie claire et capacité à couvrir l'ensemble de vos besoins (stratégie, création, publicité, web).",
    faq: [{ question: "Quel budget prévoir pour une agence digitale ?", answer: "Cela varie selon les services choisis ; un accompagnement structuré démarre généralement à partir de quelques milliers de dirhams par mois." }],
    status: "published",
    published_at: "2025-01-18",
  },
  {
    id: "blog-2",
    slug: "seo-local-casablanca-guide",
    title: "SEO local à Casablanca : le guide pour apparaître sur Google Maps",
    excerpt: "Les leviers concrets pour améliorer votre visibilité locale à Casablanca.",
    category: "SEO",
    tags: "SEO,Local",
    author: "Abdelkader Naim",
    content:
      "Le SEO local repose sur trois piliers : une fiche Google Business Profile complète, une cohérence NAP (nom, adresse, téléphone) sur le web, et des avis clients réguliers.",
    faq: [],
    status: "published",
    published_at: "2025-03-02",
  },
];
