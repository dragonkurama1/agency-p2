import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const raw = readFileSync(".env.local", "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, "");
    process.env[key] = value;
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local");
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

const services = [
  {
    slug: "creation-site-web-casablanca",
    title: "Création de site web à Casablanca",
    short_description:
      "Un site rapide, mobile-first et pensé pour transformer les visites Google, Ads et réseaux sociaux en demandes qualifiées.",
    full_description:
      "Nous créons des sites vitrines, pages d'atterrissage et sites e-commerce conçus comme des outils commerciaux. L'objectif n'est pas seulement d'avoir un beau site, mais d'aider vos visiteurs à comprendre votre offre, à faire confiance à votre marque et à demander un devis sans friction.",
    icon: "Code2",
    meta_title: "Création site web Casablanca | Site rapide et SEO",
    meta_description:
      "Création de site web à Casablanca : UX mobile, SEO, vitesse, tracking et pages conçues pour convertir vos visiteurs en demandes qualifiées.",
    keywords:
      "création site web Casablanca, agence web Casablanca, site vitrine Maroc, site e-commerce Maroc, landing page Casablanca",
    advantages_json: [
      "Structure mobile-first avec parcours clair vers contact ou devis",
      "SEO technique, balisage et maillage interne prévus dès la maquette",
      "Pages rapides, compressées et faciles à modifier depuis l'admin",
      "Tracking GA4 et événements de conversion prêts pour Google Ads",
    ],
    process_json: [
      "Audit du site actuel, des concurrents et des intentions de recherche",
      "Arborescence, wireframes et textes orientés conversion",
      "Design, développement, performance et intégration Supabase si besoin",
      "Mise en ligne, contrôle SEO et plan d'amélioration sur 30 jours",
    ],
    faq_json: [
      {
        question: "Le site sera-t-il prêt pour Google dès la mise en ligne ?",
        answer:
          "Oui. Nous préparons la structure des titres, les balises SEO, le maillage interne, la vitesse, les URLs propres et les données de conversion avant la publication.",
      },
      {
        question: "Est-ce que je pourrai modifier le contenu depuis l'admin ?",
        answer:
          "Oui. Les textes, images, pages clés et contenus reliés à Supabase restent modifiables depuis votre espace admin.",
      },
      {
        question: "Quel délai prévoir pour un site professionnel ?",
        answer:
          "Un site vitrine structuré prend généralement 3 à 6 semaines selon le nombre de pages, les contenus à produire et les validations.",
      },
    ],
    related_json: ["seo-referencement-naturel-maroc", "gestion-campagne-publicitaire", "branding-identite-visuelle"],
    order: 1,
    active: true,
  },
  {
    slug: "seo-referencement-naturel-maroc",
    title: "SEO & référencement naturel au Maroc",
    short_description:
      "Pour apparaître sur les recherches utiles à Casablanca et au Maroc avec un contenu clair, local et durable.",
    full_description:
      "Nous travaillons le SEO comme un levier d'acquisition durable : audit technique, recherche d'intentions, optimisation des pages services, contenu utile, SEO local et suivi mensuel. Chaque recommandation est reliée à un objectif concret : être trouvé par les bons prospects, pas seulement gagner du trafic.",
    icon: "TrendingUp",
    meta_title: "Agence SEO Casablanca | Référencement naturel Maroc",
    meta_description:
      "Agence SEO à Casablanca : audit technique, stratégie mots-clés, contenu utile, SEO local et suivi pour améliorer votre visibilité Google.",
    keywords:
      "agence SEO Casablanca, référencement naturel Maroc, consultant SEO Casablanca, SEO local Maroc, visibilité Google Casablanca",
    advantages_json: [
      "Audit technique : indexation, vitesse, structure, contenus et erreurs bloquantes",
      "Recherche de mots-clés par intention : local, commercial, informationnel",
      "Optimisation on-page, maillage interne et données structurées visibles",
      "Reporting mensuel avec priorités, positions, trafic et demandes générées",
    ],
    process_json: [
      "Diagnostic SEO et analyse des concurrents sur Google",
      "Carte de mots-clés par service, ville, secteur et niveau d'intention",
      "Optimisation des pages existantes et plan éditorial priorisé",
      "Suivi des positions, contenus, backlinks et conversions chaque mois",
    ],
    faq_json: [
      {
        question: "En combien de temps le SEO donne-t-il des résultats ?",
        answer:
          "Les premiers signaux apparaissent souvent en 2 à 3 mois. Les positions réellement solides demandent généralement 4 à 8 mois selon la concurrence et l'état du site.",
      },
      {
        question: "Travaillez-vous le SEO local à Casablanca ?",
        answer:
          "Oui. Nous optimisons les pages locales, Google Business Profile, les contenus de proximité, la cohérence des informations et les liens internes vers les services.",
      },
      {
        question: "Le contenu est-il écrit pour Google ou pour les clients ?",
        answer:
          "Les deux, mais dans le bon ordre : d'abord répondre clairement aux questions du client, puis structurer le contenu pour que Google comprenne la page.",
      },
    ],
    related_json: ["creation-site-web-casablanca", "marketing-strategique", "gestion-campagne-publicitaire"],
    order: 2,
    active: true,
  },
  {
    slug: "gestion-campagne-publicitaire",
    title: "Google Ads, Meta Ads & campagnes publicitaires",
    short_description:
      "Des campagnes pilotées au coût par lead, avec tracking, tests créatifs et optimisation continue.",
    full_description:
      "Nous structurons et pilotons vos campagnes Google Ads, Meta Ads, TikTok Ads ou LinkedIn Ads avec une logique simple : mesurer avant d'accélérer. Ciblage, tracking, créations, landing pages et reporting sont pensés ensemble pour réduire le gaspillage de budget et améliorer le coût d'acquisition.",
    icon: "Megaphone",
    meta_title: "Agence Google Ads & Meta Ads Casablanca | Prestigia",
    meta_description:
      "Gestion Google Ads et Meta Ads au Maroc : tracking, ciblage, créatifs, landing pages et reporting CPA pour générer des leads qualifiés.",
    keywords:
      "Google Ads Casablanca, Meta Ads Maroc, Facebook Ads Maroc, agence publicité digitale Maroc, campagne publicitaire Casablanca",
    advantages_json: [
      "Campagnes séparées par intention, zone, audience et maturité du prospect",
      "Tracking GA4, événements de conversion et sources de leads vérifiables",
      "Créatifs publicitaires testés : hooks, visuels, vidéos courtes et textes",
      "Reporting clair : coût par lead, ROAS, budget dépensé et décisions du mois",
    ],
    process_json: [
      "Audit du compte, objectifs commerciaux et budget disponible",
      "Plan média, tracking, audiences, mots-clés et messages publicitaires",
      "Lancement contrôlé avec tests créatifs et exclusions régulières",
      "Optimisation hebdomadaire puis rapport mensuel orienté décisions",
    ],
    faq_json: [
      {
        question: "Quel budget minimum faut-il prévoir ?",
        answer:
          "Pour un vrai test à Casablanca ou au Maroc, il faut généralement prévoir un budget média de départ cohérent avec votre coût de lead cible. Nous le cadrons avant lancement.",
      },
      {
        question: "Google Ads ou Meta Ads : par quoi commencer ?",
        answer:
          "Google Ads capte souvent une intention déjà active. Meta Ads crée plus de demande et relance les audiences. Le choix dépend de votre offre, du cycle de vente et de vos contenus.",
      },
      {
        question: "Qui garde la propriété du compte publicitaire ?",
        answer:
          "Vous. Les comptes, pixels, données GA4 et accès restent au nom de votre entreprise pour garder la maîtrise de votre historique.",
      },
    ],
    related_json: ["creation-site-web-casablanca", "creation-contenu-photo-video", "seo-referencement-naturel-maroc"],
    order: 3,
    active: true,
  },
  {
    slug: "community-management-casablanca",
    title: "Community management à Casablanca",
    short_description:
      "Une présence sociale régulière, cohérente et reliée à vos objectifs commerciaux.",
    full_description:
      "Nous gérons vos réseaux sociaux comme un point de contact client, pas comme une simple galerie de posts. Ligne éditoriale, calendrier, modération, formats Reels, carrousels, stories et reporting permettent de construire une communauté utile à la notoriété, à la confiance et aux ventes.",
    icon: "Share2",
    meta_title: "Community Management Casablanca | Réseaux sociaux",
    meta_description:
      "Community management à Casablanca : stratégie social media, calendrier éditorial, Reels, modération et reporting pour engager votre audience.",
    keywords:
      "community management Casablanca, agence social media Casablanca, gestion réseaux sociaux Maroc, Instagram Maroc, LinkedIn Maroc",
    advantages_json: [
      "Calendrier éditorial aligné avec vos offres, saisons et objectifs",
      "Formats adaptés : Reels, carrousels, stories, posts preuve et contenus éducatifs",
      "Modération et réponses pour protéger l'expérience client",
      "Suivi de l'engagement, des messages entrants et des contenus qui génèrent des demandes",
    ],
    process_json: [
      "Audit des comptes, contenus, concurrents et attentes de l'audience",
      "Définition des piliers éditoriaux, ton de marque et calendrier",
      "Création, validation, publication et animation de la communauté",
      "Analyse mensuelle : portée, engagement, messages, demandes et ajustements",
    ],
    faq_json: [
      {
        question: "Publier plus souvent suffit-il à vendre plus ?",
        answer:
          "Non. La fréquence aide, mais la qualité des angles, la clarté de l'offre, la preuve client et les appels à l'action font la différence.",
      },
      {
        question: "Pouvez-vous gérer Instagram, Facebook, LinkedIn et TikTok ?",
        answer:
          "Oui, mais nous priorisons les plateformes selon votre audience. Une présence forte sur deux canaux vaut mieux qu'une présence faible partout.",
      },
      {
        question: "Les messages clients sont-ils suivis ?",
        answer:
          "Oui. Nous pouvons cadrer les réponses, les relances et les passages vers WhatsApp, formulaire ou équipe commerciale.",
      },
    ],
    related_json: ["creation-contenu-photo-video", "gestion-campagne-publicitaire", "automatisation-whatsapp-crm"],
    order: 4,
    active: true,
  },
  {
    slug: "creation-contenu-photo-video",
    title: "Création de contenu photo & vidéo",
    short_description:
      "Des photos, Reels et vidéos verticales qui montrent votre offre, votre équipe et vos preuves de façon claire.",
    full_description:
      "Nous produisons les contenus dont vos pages, réseaux sociaux et publicités ont besoin : photos professionnelles, Reels, capsules pédagogiques, vidéos de marque, UGC, formats verticaux et déclinaisons publicitaires. Chaque tournage est pensé pour créer plusieurs assets utiles, pas une seule belle vidéo isolée.",
    icon: "Camera",
    meta_title: "Création contenu photo vidéo Casablanca | Prestigia",
    meta_description:
      "Production photo et vidéo à Casablanca : Reels, UGC, shooting, vidéos verticales et contenus publicitaires pour réseaux sociaux et site web.",
    keywords:
      "création contenu vidéo Casablanca, production photo Casablanca, Reels Maroc, UGC Maroc, shooting professionnel Casablanca",
    advantages_json: [
      "Brief créatif relié à vos objectifs de vente, notoriété ou recrutement",
      "Production multi-format : site, Reels, TikTok, Ads, LinkedIn et stories",
      "Direction artistique, captation, montage, sous-titres et déclinaisons",
      "Bibliothèque de contenus réutilisable pour plusieurs semaines de publication",
    ],
    process_json: [
      "Cadrage des messages, formats, références et scènes nécessaires",
      "Planning de tournage, shotlist, préparation des lieux et validation",
      "Captation photo/vidéo puis montage adapté à chaque plateforme",
      "Livraison organisée avec titres, formats, versions courtes et recommandations",
    ],
    faq_json: [
      {
        question: "Les vidéos peuvent-elles être au format Reel Instagram ?",
        answer:
          "Oui. Nous livrons les formats verticaux 9:16 adaptés à Instagram Reels, TikTok, YouTube Shorts et publicités Meta.",
      },
      {
        question: "Peut-on produire plusieurs contenus en une seule journée ?",
        answer:
          "Oui. Nous préparons le tournage pour obtenir plusieurs capsules, photos, extraits et hooks à partir d'une même session.",
      },
      {
        question: "Fournissez-vous les textes et sous-titres ?",
        answer:
          "Oui. Les scripts courts, titres, sous-titres et variantes publicitaires peuvent être inclus dans la production.",
      },
    ],
    related_json: ["community-management-casablanca", "gestion-campagne-publicitaire", "video-3d-animation-maroc"],
    order: 5,
    active: true,
  },
  {
    slug: "branding-identite-visuelle",
    title: "Branding & identité visuelle",
    short_description:
      "Une marque plus claire, plus reconnaissable et plus facile à déployer sur le web, les réseaux et les supports commerciaux.",
    full_description:
      "Nous construisons ou clarifions votre identité de marque : positionnement, logo, charte graphique, ton de voix, messages clés et déclinaisons digitales. Le but est de rendre votre entreprise immédiatement compréhensible, crédible et mémorable sur chaque point de contact.",
    icon: "Sparkles",
    meta_title: "Branding Casablanca | Identité visuelle et logo",
    meta_description:
      "Branding à Casablanca : positionnement, logo, charte graphique, messages de marque et identité visuelle prête pour web et réseaux sociaux.",
    keywords:
      "branding Casablanca, identité visuelle Maroc, création logo Casablanca, charte graphique Maroc, stratégie de marque Maroc",
    advantages_json: [
      "Positionnement clair avant la création visuelle",
      "Système graphique utilisable sur site, réseaux, présentation et publicité",
      "Ton de voix et messages pour rendre l'offre plus facile à comprendre",
      "Livrables organisés pour votre équipe, imprimeur, développeur ou community manager",
    ],
    process_json: [
      "Immersion : offre, cible, concurrents, objections et codes du marché",
      "Direction de marque : positionnement, promesse, ton et territoires visuels",
      "Création du logo, système graphique et premières déclinaisons",
      "Charte finale, fichiers sources et recommandations d'usage",
    ],
    faq_json: [
      {
        question: "Faut-il refaire tout le logo pour améliorer une marque ?",
        answer:
          "Pas toujours. Parfois une clarification du positionnement, des couleurs, du ton et des supports suffit à rendre la marque plus professionnelle.",
      },
      {
        question: "Le branding aide-t-il vraiment la conversion ?",
        answer:
          "Oui. Une marque cohérente réduit le doute, rend l'offre plus lisible et améliore la confiance avant la demande de devis.",
      },
      {
        question: "Livrez-vous une charte exploitable par l'équipe ?",
        answer:
          "Oui. La charte explique les couleurs, typographies, usages du logo, styles visuels, messages et exemples d'application.",
      },
    ],
    related_json: ["creation-site-web-casablanca", "creation-contenu-photo-video", "marketing-strategique"],
    order: 6,
    active: true,
  },
  {
    slug: "strategie-digitale-pme-maroc",
    title: "Stratégie digitale pour PME marocaines",
    short_description:
      "Un plan d'action priorisé pour savoir quoi faire, dans quel ordre, avec quel budget et quels indicateurs.",
    full_description:
      "Nous aidons les PME marocaines à transformer une présence digitale dispersée en feuille de route claire. Diagnostic, concurrence, parcours client, canaux, budget, contenus, tracking et priorités sont réunis dans un plan concret sur 30, 60 ou 90 jours.",
    icon: "Compass",
    meta_title: "Stratégie digitale PME Maroc | Plan marketing 90 jours",
    meta_description:
      "Stratégie digitale pour PME au Maroc : audit, concurrence, canaux, budget, contenus et plan d'action priorisé pour générer des leads.",
    keywords:
      "stratégie digitale PME Maroc, marketing digital PME Casablanca, plan marketing digital Maroc, audit digital Casablanca",
    advantages_json: [
      "Vision claire avant de dépenser en publicité ou production de contenu",
      "Priorités classées par impact, effort, budget et délai",
      "Parcours client relié au site, réseaux sociaux, WhatsApp et campagnes",
      "Tableau d'indicateurs simple pour suivre les décisions chaque mois",
    ],
    process_json: [
      "Audit de présence digitale, offre, cible, marché et concurrents",
      "Identification des canaux utiles : SEO, Ads, social, contenu, CRM",
      "Roadmap 30-60-90 jours avec responsabilités et budget estimatif",
      "Point de pilotage pour ajuster les actions selon les résultats",
    ],
    faq_json: [
      {
        question: "Cette prestation est-elle utile avant de lancer des publicités ?",
        answer:
          "Oui. Elle évite de lancer des campagnes sans offre claire, sans tracking ou sans page capable de convertir.",
      },
      {
        question: "Est-ce adapté à une petite entreprise ?",
        answer:
          "Oui. La stratégie est justement priorisée pour concentrer le budget sur les actions qui ont le plus d'impact.",
      },
      {
        question: "Recevons-nous un plan concret ?",
        answer:
          "Oui. Vous repartez avec une roadmap claire : actions, ordre de priorité, budget, contenus à produire et indicateurs à suivre.",
      },
    ],
    related_json: ["marketing-strategique", "seo-referencement-naturel-maroc", "gestion-campagne-publicitaire"],
    order: 7,
    active: true,
  },
  {
    slug: "automatisation-whatsapp-crm",
    title: "Automatisation WhatsApp, CRM & leads",
    short_description:
      "Pour répondre plus vite, qualifier les prospects et suivre chaque demande sans perdre de lead.",
    full_description:
      "Nous connectons vos formulaires, WhatsApp Business, CRM et scénarios de relance afin de fluidifier l'expérience prospect. L'objectif est simple : réduire le temps de réponse, mieux qualifier les demandes et donner à votre équipe une vision claire du pipeline commercial.",
    icon: "Workflow",
    meta_title: "Automatisation WhatsApp CRM Maroc | Leads et suivi",
    meta_description:
      "Automatisation WhatsApp et CRM au Maroc : formulaires, relances, qualification des leads et pipeline commercial pour ne perdre aucune demande.",
    keywords:
      "automatisation WhatsApp Maroc, CRM Maroc, génération de leads Maroc, WhatsApp Business Casablanca, automatisation marketing Maroc",
    advantages_json: [
      "Réponse plus rapide après formulaire, message WhatsApp ou campagne",
      "Qualification des prospects selon besoin, budget, ville et délai",
      "Relances automatiques sans oublier les demandes froides",
      "Pipeline clair pour savoir quels leads traiter en priorité",
    ],
    process_json: [
      "Cartographie du parcours lead : arrivée, qualification, relance, vente",
      "Choix des outils : WhatsApp Business, CRM, formulaires, notifications",
      "Configuration des scénarios, champs, messages et statuts",
      "Tests, formation équipe et suivi des premières conversions",
    ],
    faq_json: [
      {
        question: "Peut-on relier le site web à WhatsApp ?",
        answer:
          "Oui. Nous pouvons connecter formulaires, boutons WhatsApp, notifications internes et suivi CRM pour centraliser les demandes.",
      },
      {
        question: "L'automatisation remplace-t-elle l'équipe commerciale ?",
        answer:
          "Non. Elle enlève les tâches répétitives et aide l'équipe à répondre plus vite avec les bonnes informations.",
      },
      {
        question: "Peut-on suivre la source de chaque lead ?",
        answer:
          "Oui. Les sources comme Google Ads, Meta Ads, SEO, réseaux sociaux ou formulaire peuvent être suivies si le tracking est bien configuré.",
      },
    ],
    related_json: ["gestion-campagne-publicitaire", "creation-site-web-casablanca", "strategie-digitale-pme-maroc"],
    order: 8,
    active: true,
  },
  {
    slug: "video-3d-animation-maroc",
    title: "Vidéo 3D & animation",
    short_description:
      "Motion design, animation 3D et vidéos explicatives pour rendre une offre complexe plus simple à comprendre.",
    full_description:
      "Nous créons des animations 3D, motion design, intros, vidéos explicatives et assets immersifs pour présenter un produit, un service ou une idée de façon plus mémorable. Cette prestation est utile quand une photo réelle ne suffit pas à expliquer la valeur ou l'univers de la marque.",
    icon: "Clapperboard",
    meta_title: "Vidéo 3D et motion design Maroc | Prestigia",
    meta_description:
      "Création vidéo 3D et motion design au Maroc : animations produit, vidéos explicatives, intros de marque et contenus immersifs.",
    keywords:
      "vidéo 3D Maroc, motion design Casablanca, animation 3D Maroc, explainer video Maroc, vidéo immersive Maroc",
    advantages_json: [
      "Rendre visible un concept, un produit ou un service difficile à filmer",
      "Créer des assets premium pour site, présentation, réseaux et publicité",
      "Déclinaisons courtes pour Reels, ads, écrans et pages de vente",
      "Direction artistique cohérente avec votre identité de marque",
    ],
    process_json: [
      "Brief, références visuelles, objectif et message principal",
      "Script court, storyboard et choix du style d'animation",
      "Production 3D ou motion design avec validations intermédiaires",
      "Export final aux formats web, social, présentation ou affichage",
    ],
    faq_json: [
      {
        question: "Quand choisir la 3D plutôt qu'une vidéo classique ?",
        answer:
          "La 3D est pertinente pour expliquer un produit, visualiser un concept, créer un univers premium ou montrer ce qui n'existe pas encore physiquement.",
      },
      {
        question: "Pouvez-vous faire des formats courts pour publicité ?",
        answer:
          "Oui. Les animations peuvent être déclinées en formats courts pour Meta Ads, TikTok, YouTube Shorts ou landing pages.",
      },
      {
        question: "Combien de temps prend une animation ?",
        answer:
          "Selon la durée et la complexité, comptez généralement 2 à 5 semaines pour une animation bien cadrée et prête à diffuser.",
      },
    ],
    related_json: ["creation-contenu-photo-video", "branding-identite-visuelle", "creation-site-web-casablanca"],
    order: 9,
    active: true,
  },
  {
    slug: "gestion-evenement-maroc",
    title: "Gestion d'événement & couverture digitale",
    short_description:
      "Organisation, communication et contenus photo/vidéo pour faire vivre votre événement avant, pendant et après.",
    full_description:
      "Nous accompagnons les événements professionnels avec une logique complète : cadrage, identité visuelle, annonces, couverture photo/vidéo, live social media, contenus post-événement et suivi des retombées. L'événement devient un moment de marque exploitable sur plusieurs canaux.",
    icon: "CalendarCheck",
    meta_title: "Gestion événement Maroc | Communication et couverture",
    meta_description:
      "Gestion d'événement au Maroc : planning, identité visuelle, communication digitale, live social media et couverture photo vidéo.",
    keywords:
      "gestion événement Maroc, organisation événement Casablanca, communication événementielle Maroc, couverture photo vidéo événement",
    advantages_json: [
      "Plan de communication avant, pendant et après l'événement",
      "Identité visuelle événementielle et supports digitaux cohérents",
      "Couverture photo, vidéo, stories et contenus instantanés",
      "Exploitation post-événement : recap, témoignages, clips et publications",
    ],
    process_json: [
      "Brief événement, objectifs, public, timing, contraintes et lieux",
      "Planning, identité, supports et calendrier de communication",
      "Coordination et couverture digitale le jour J",
      "Livraison des contenus, bilan et recommandations pour la prochaine édition",
    ],
    faq_json: [
      {
        question: "Intervenez-vous hors de Casablanca ?",
        answer:
          "Oui. Nous pouvons accompagner des événements à Casablanca et dans d'autres villes marocaines selon le format et le planning.",
      },
      {
        question: "Pouvez-vous gérer les contenus en direct ?",
        answer:
          "Oui. Stories, photos, courtes vidéos, posts et contenus de recap peuvent être produits pendant l'événement.",
      },
      {
        question: "L'événement peut-il alimenter le blog ou les réseaux après coup ?",
        answer:
          "Oui. Nous préparons des contenus réutilisables : recap, témoignages, coulisses, capsules courtes et supports de preuve.",
      },
    ],
    related_json: ["creation-contenu-photo-video", "community-management-casablanca", "branding-identite-visuelle"],
    order: 10,
    active: true,
  },
  {
    slug: "marketing-strategique",
    title: "Marketing stratégique",
    short_description:
      "Analyse de marché, positionnement, offre et plan de croissance pour prendre de meilleures décisions avant d'exécuter.",
    full_description:
      "Nous clarifions votre marché, votre cible, votre offre, vos concurrents et vos messages pour construire une stratégie marketing solide. Cette étape donne une base plus fiable aux décisions de branding, site web, publicité, SEO et contenu.",
    icon: "BarChart3",
    meta_title: "Marketing stratégique Maroc | Positionnement et plan",
    meta_description:
      "Marketing stratégique au Maroc : analyse concurrentielle, positionnement, offre, messages et plan d'action pour guider vos campagnes.",
    keywords:
      "marketing stratégique Maroc, analyse concurrentielle Maroc, positionnement marque Maroc, plan marketing Casablanca",
    advantages_json: [
      "Comprendre le marché avant de produire ou dépenser",
      "Clarifier la proposition de valeur et les messages prioritaires",
      "Identifier les segments clients, objections et leviers de confiance",
      "Transformer l'analyse en plan d'action exploitable par l'équipe",
    ],
    process_json: [
      "Recherche marché, concurrents, offres, contenus et parcours clients",
      "Positionnement, promesse, segments et angles de communication",
      "Plan marketing : canaux, priorités, budget, contenus et indicateurs",
      "Transmission claire pour exécution sur site, SEO, Ads, réseaux et CRM",
    ],
    faq_json: [
      {
        question: "Pourquoi faire de la stratégie avant le site ou les campagnes ?",
        answer:
          "Parce qu'un bon site ou une bonne campagne dépend d'une offre claire, d'un message précis et d'une cible bien comprise.",
      },
      {
        question: "Est-ce utile si l'entreprise existe déjà ?",
        answer:
          "Oui. La stratégie permet souvent de corriger un positionnement flou, des messages dispersés ou des canaux qui ne correspondent plus au marché.",
      },
      {
        question: "Le livrable est-il actionnable ?",
        answer:
          "Oui. Le document contient les priorités, messages, canaux, contenus à produire et indicateurs à suivre.",
      },
    ],
    related_json: ["strategie-digitale-pme-maroc", "branding-identite-visuelle", "seo-referencement-naturel-maroc"],
    order: 11,
    active: true,
  },
];

const serviceTitles = Object.fromEntries(services.map((service) => [service.slug, service.title]));

const blogServiceBySlug = {
  "budget-marketing-digital-repartition-2026": "strategie-digitale-pme-maroc",
  "ga4-marketing-mix-modeling-roi-2026": "marketing-strategique",
  "email-marketing-automatise-ecommerce-maroc-2026": "automatisation-whatsapp-crm",
  "structurer-contenu-geo-ia-2026": "seo-referencement-naturel-maroc",
  "site-web-mobile-first-maroc-2026": "creation-site-web-casablanca",
  "branding-local-marque-maroc-2026": "branding-identite-visuelle",
  "whatsapp-business-ventes-casablanca-2026": "automatisation-whatsapp-crm",
  "reels-ads-meta-2026": "creation-contenu-photo-video",
  "google-ads-ask-advisor-ia-2026": "gestion-campagne-publicitaire",
  "netlinking-local-maroc-2026": "seo-referencement-naturel-maroc",
  "community-management-maroc-2026": "community-management-casablanca",
  "google-ads-performance-max-maroc-2026": "gestion-campagne-publicitaire",
  "personal-branding-linkedin-maroc-2026": "branding-identite-visuelle",
  "e-e-a-t-seo-google-2026": "seo-referencement-naturel-maroc",
  "video-courte-marketing-maroc-2026": "creation-contenu-photo-video",
  "ia-automatisation-marketing-agences-2026": "automatisation-whatsapp-crm",
  "seo-local-casablanca-maroc-2026": "seo-referencement-naturel-maroc",
  "meta-ads-advantage-plus-2026": "gestion-campagne-publicitaire",
  "tendances-marketing-digital-maroc-2026": "strategie-digitale-pme-maroc",
  "geo-optimisation-ia-2026": "seo-referencement-naturel-maroc",
  "comment-choisir-agence-marketing-digital": "strategie-digitale-pme-maroc",
};

const fallbackServiceByCategory = {
  SEO: "seo-referencement-naturel-maroc",
  GEO: "seo-referencement-naturel-maroc",
  Publicité: "gestion-campagne-publicitaire",
  "Google Ads": "gestion-campagne-publicitaire",
  "Réseaux Sociaux": "community-management-casablanca",
  Branding: "branding-identite-visuelle",
  "Développement Web": "creation-site-web-casablanca",
  "IA & Automatisation": "automatisation-whatsapp-crm",
  "Email Marketing": "automatisation-whatsapp-crm",
  "Marketing Digital": "strategie-digitale-pme-maroc",
  "Stratégie Digitale": "strategie-digitale-pme-maroc",
};

const seoKeywords = [
  {
    page_slug: "services",
    primary_keyword: "services marketing digital Casablanca",
    secondary_keywords:
      "agence marketing digital Maroc, SEO Casablanca, Google Ads Maroc, community management Casablanca, création contenu Casablanca",
    search_intent: "Commerciale",
    title_suggestion: "Services marketing digital à Casablanca | Prestigia Agency",
    description_suggestion:
      "Services marketing digital à Casablanca : site web, SEO, Google Ads, contenu, branding, automation et stratégie pour générer des leads.",
  },
  {
    page_slug: "creation-site-web-casablanca",
    primary_keyword: "création site web Casablanca",
    secondary_keywords: "agence web Casablanca, site vitrine Maroc, site e-commerce Maroc, landing page Casablanca",
    search_intent: "Transactionnelle",
    title_suggestion: "Création site web Casablanca | Site rapide et SEO",
    description_suggestion:
      "Création de site web à Casablanca : UX mobile, SEO, vitesse, tracking et pages conçues pour convertir vos visiteurs en demandes qualifiées.",
  },
  {
    page_slug: "seo-referencement-naturel-maroc",
    primary_keyword: "agence SEO Casablanca",
    secondary_keywords: "référencement naturel Maroc, SEO local Casablanca, visibilité Google Maroc, consultant SEO Casablanca",
    search_intent: "Commerciale",
    title_suggestion: "Agence SEO Casablanca | Référencement naturel Maroc",
    description_suggestion:
      "Agence SEO à Casablanca : audit technique, stratégie mots-clés, contenu utile, SEO local et suivi pour améliorer votre visibilité Google.",
  },
  {
    page_slug: "gestion-campagne-publicitaire",
    primary_keyword: "Google Ads Casablanca",
    secondary_keywords: "Meta Ads Maroc, Facebook Ads Maroc, campagne publicitaire Maroc, agence publicité digitale Casablanca",
    search_intent: "Commerciale / transactionnelle",
    title_suggestion: "Agence Google Ads & Meta Ads Casablanca | Prestigia",
    description_suggestion:
      "Gestion Google Ads et Meta Ads au Maroc : tracking, ciblage, créatifs, landing pages et reporting CPA pour générer des leads qualifiés.",
  },
  {
    page_slug: "community-management-casablanca",
    primary_keyword: "community management Casablanca",
    secondary_keywords: "agence social media Casablanca, gestion réseaux sociaux Maroc, Instagram Maroc, LinkedIn Maroc",
    search_intent: "Commerciale",
    title_suggestion: "Community Management Casablanca | Réseaux sociaux",
    description_suggestion:
      "Community management à Casablanca : stratégie social media, calendrier éditorial, Reels, modération et reporting pour engager votre audience.",
  },
  {
    page_slug: "creation-contenu-photo-video",
    primary_keyword: "création contenu vidéo Casablanca",
    secondary_keywords: "production photo Casablanca, Reels Maroc, UGC Maroc, shooting professionnel Casablanca",
    search_intent: "Commerciale",
    title_suggestion: "Création contenu photo vidéo Casablanca | Prestigia",
    description_suggestion:
      "Production photo et vidéo à Casablanca : Reels, UGC, shooting, vidéos verticales et contenus publicitaires pour réseaux sociaux et site web.",
  },
  {
    page_slug: "branding-identite-visuelle",
    primary_keyword: "branding Casablanca",
    secondary_keywords: "identité visuelle Maroc, création logo Casablanca, charte graphique Maroc, stratégie de marque Maroc",
    search_intent: "Commerciale",
    title_suggestion: "Branding Casablanca | Identité visuelle et logo",
    description_suggestion:
      "Branding à Casablanca : positionnement, logo, charte graphique, messages de marque et identité visuelle prête pour web et réseaux sociaux.",
  },
  {
    page_slug: "strategie-digitale-pme-maroc",
    primary_keyword: "stratégie digitale PME Maroc",
    secondary_keywords: "marketing digital PME Casablanca, plan marketing digital Maroc, audit digital Casablanca",
    search_intent: "Commerciale / évaluative",
    title_suggestion: "Stratégie digitale PME Maroc | Plan marketing 90 jours",
    description_suggestion:
      "Stratégie digitale pour PME au Maroc : audit, concurrence, canaux, budget, contenus et plan d'action priorisé pour générer des leads.",
  },
  {
    page_slug: "automatisation-whatsapp-crm",
    primary_keyword: "automatisation WhatsApp Maroc",
    secondary_keywords: "CRM Maroc, WhatsApp Business Casablanca, génération de leads Maroc, automatisation marketing Maroc",
    search_intent: "Commerciale",
    title_suggestion: "Automatisation WhatsApp CRM Maroc | Leads et suivi",
    description_suggestion:
      "Automatisation WhatsApp et CRM au Maroc : formulaires, relances, qualification des leads et pipeline commercial pour ne perdre aucune demande.",
  },
  {
    page_slug: "video-3d-animation-maroc",
    primary_keyword: "vidéo 3D Maroc",
    secondary_keywords: "motion design Casablanca, animation 3D Maroc, vidéo immersive Maroc, explainer video Maroc",
    search_intent: "Commerciale",
    title_suggestion: "Vidéo 3D et motion design Maroc | Prestigia",
    description_suggestion:
      "Création vidéo 3D et motion design au Maroc : animations produit, vidéos explicatives, intros de marque et contenus immersifs.",
  },
  {
    page_slug: "gestion-evenement-maroc",
    primary_keyword: "gestion événement Maroc",
    secondary_keywords:
      "organisation événement Casablanca, communication événementielle Maroc, couverture photo vidéo événement",
    search_intent: "Commerciale",
    title_suggestion: "Gestion événement Maroc | Communication et couverture",
    description_suggestion:
      "Gestion d'événement au Maroc : planning, identité visuelle, communication digitale, live social media et couverture photo vidéo.",
  },
  {
    page_slug: "marketing-strategique",
    primary_keyword: "marketing stratégique Maroc",
    secondary_keywords: "analyse concurrentielle Maroc, positionnement marque Maroc, plan marketing Casablanca",
    search_intent: "Commerciale / stratégique",
    title_suggestion: "Marketing stratégique Maroc | Positionnement et plan",
    description_suggestion:
      "Marketing stratégique au Maroc : analyse concurrentielle, positionnement, offre, messages et plan d'action pour guider vos campagnes.",
  },
];

function stripServiceBlock(content = "") {
  const marker = "\n## Service recommandé";
  const index = content.indexOf(marker);
  if (index >= 0) return content.slice(0, index).trim();
  if (content.startsWith("## Service recommandé")) return "";
  return content.trim();
}

function serviceBlock(serviceSlug) {
  const title = serviceTitles[serviceSlug] || "nos services marketing digital";
  return [
    "## Service recommandé",
    "",
    `Si ce sujet correspond à votre situation, Prestigia Agency peut vous accompagner avec le service [${title}](/services/${serviceSlug}). Nous partons de votre objectif, de votre marché et de vos contenus existants pour construire un plan concret, mesurable et modifiable depuis l'admin.`,
    "",
    `[Voir le service ${title}](/services/${serviceSlug})`,
  ].join("\n");
}

async function updateSeoKeyword(item) {
  const { data, error } = await supabase
    .from("seo_keywords")
    .select("id")
    .eq("page_slug", item.page_slug)
    .limit(1);
  if (error) throw error;

  if (data?.[0]?.id) {
    const { error: updateError } = await supabase
      .from("seo_keywords")
      .update(item)
      .eq("id", data[0].id);
    if (updateError) throw updateError;
    return;
  }

  const { error: insertError } = await supabase.from("seo_keywords").insert(item);
  if (insertError) throw insertError;
}

async function main() {
  const { error: serviceError } = await supabase
    .from("services")
    .upsert(services, { onConflict: "slug" });
  if (serviceError) throw serviceError;

  await supabase
    .from("seo_keywords")
    .update({ page_slug: "gestion-campagne-publicitaire" })
    .eq("page_slug", "google-ads-meta-ads-maroc");

  for (const item of seoKeywords) {
    await updateSeoKeyword(item);
  }

  const { error: pagesError } = await supabase
    .from("pages")
    .upsert(
      {
        slug: "services",
        title: "Services marketing digital à Casablanca",
        subtitle: "Site web, SEO, publicité, contenu, branding, automation et stratégie reliés à vos objectifs commerciaux.",
        content:
          "Nos services sont pensés pour guider un prospect depuis sa première recherche Google jusqu'à la demande de devis : pages rapides, contenu utile, campagnes mesurées, réseaux sociaux cohérents et suivi des leads.",
        meta_title: "Services marketing digital à Casablanca | Prestigia Agency",
        meta_description:
          "Découvrez nos services marketing digital à Casablanca : site web, SEO, Google Ads, Meta Ads, contenu, branding, automation et stratégie.",
        status: "published",
      },
      { onConflict: "slug" }
    );
  if (pagesError) throw pagesError;

  const { error: sectionError } = await supabase
    .from("sections")
    .upsert(
      [
        {
          page_slug: "services",
          section_key: "hero",
          title: "Des services digitaux reliés à vos ventes, pas seulement à votre visibilité.",
          subtitle:
            "Chaque prestation part de votre objectif client : être trouvé sur Google, rassurer plus vite, générer des demandes qualifiées et suivre ce qui fonctionne.",
          button_text: "Demander un diagnostic",
          button_link: "/devis",
          order: 1,
          active: true,
        },
        {
          page_slug: "blog",
          section_key: "hero",
          title: "Conseils marketing digital, reliés à des actions concrètes.",
          subtitle:
            "Chaque article explique un sujet utile puis vous oriente vers le service Prestigia Agency qui permet de le mettre en pratique.",
          button_text: "Voir les services",
          button_link: "/services",
          order: 1,
          active: true,
        },
      ],
      { onConflict: "page_slug,section_key" }
    );
  if (sectionError) throw sectionError;

  const { data: posts, error: postsError } = await supabase
    .from("blog_posts")
    .select("id, slug, category, content")
    .eq("status", "published");
  if (postsError) throw postsError;

  for (const post of posts ?? []) {
    const serviceSlug =
      blogServiceBySlug[post.slug] ||
      fallbackServiceByCategory[post.category] ||
      "strategie-digitale-pme-maroc";
    const base = stripServiceBlock(post.content || "");
    const content = `${base}\n\n${serviceBlock(serviceSlug)}`.trim();
    const { error } = await supabase
      .from("blog_posts")
      .update({ content })
      .eq("id", post.id);
    if (error) throw error;
  }

  const { error: auditError } = await supabase.from("audit_log").insert({
    action: "content_seo_update",
    entity_type: "services_blog_posts",
    entity_id: "services_blog_cta_2026_08_22",
    details: {
      services_updated: services.length,
      blog_posts_updated: posts?.length ?? 0,
      source: "codex",
      focus: "service pages, Google reach, internal blog-to-service links",
    },
  });
  if (auditError) throw auditError;

  console.log(
    JSON.stringify(
      {
        services_updated: services.length,
        blog_posts_updated: posts?.length ?? 0,
        seo_keywords_updated: seoKeywords.length,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
