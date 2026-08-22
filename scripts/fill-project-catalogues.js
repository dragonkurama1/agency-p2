import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function parseEnv(file) {
  const out = {};
  const text = fs.readFileSync(file, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const env = parseEnv(".env.local");
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error("Configuration Supabase manquante");
}

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

const profMedia = [
  "https://nmshvimuahdepunoeeho.supabase.co/storage/v1/object/public/media/projects/prof-amouz/prof-amouz-tournage.webp",
  "https://nmshvimuahdepunoeeho.supabase.co/storage/v1/object/public/media/projects/prof-amouz/prof-amouz-capsule.webp",
  "https://nmshvimuahdepunoeeho.supabase.co/storage/v1/object/public/media/projects/prof-amouz/prof-amouz-suivi.webp",
];

const media = {
  yahya: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85&auto=format&fit=crop",
  ],
  atlas: [
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1400&q=85&auto=format&fit=crop",
  ],
  villa: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1400&q=85&auto=format&fit=crop",
  ],
  orion: [
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1400&q=85&auto=format&fit=crop",
  ],
  restaurant: [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1400&q=85&auto=format&fit=crop",
  ],
  sport: [
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=1400&q=85&auto=format&fit=crop",
  ],
  health: [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1400&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&q=85&auto=format&fit=crop",
  ],
};

function catalogue({ title, summary, vision, audience, metrics, workflow, examples, quality }) {
  return { eyebrow: "Catalogue étude projet", title, summary, vision, audience, metrics, workflow, examples, quality };
}

function baseMetrics(kind, count = "18") {
  return [
    { label: "Publications prévues", value: count, detail: "contenus courts, carrousels, photos et rappels éditoriaux" },
    { label: "Formats à produire", value: "4", detail: "reels, photos, stories et contenu site" },
    { label: "Vues à suivre", value: "KPI", detail: "portée, rétention, clics et demandes qualifiées" },
    { label: "Qualité média", value: kind, detail: "cadre propre, image nette, son clair et identité cohérente" },
  ];
}

function standardWorkflow(context) {
  return [
    { title: "Cadrage", text: `Compréhension du projet, de la cible et du message prioritaire avant toute production ${context}.` },
    { title: "Préparation", text: "Plan de contenu, liste des prises, calendrier éditorial et structure des messages clés." },
    { title: "Production", text: "Prise photo, captation vidéo, sélection des meilleurs angles, montage et déclinaisons réseaux sociaux." },
    { title: "Suivi", text: "Lecture des performances, ajustement des formats et amélioration continue depuis les données collectées." },
  ];
}

const projects = [
  {
    id: "3ff1bc6e-1dbe-4c01-b398-f9d9dbd1f507",
    slug: "prof-amouz-catalogue-etude-projet",
    title: "Catalogue étude projet - Prof Amouz",
    client_name: "Prof Amouz",
    category: "Éducation",
    sector: "Éducation",
    featured: true,
    description: "Un catalogue d'étude projet en français pour présenter l'accompagnement complet : compréhension de la vision du professeur, production photo/vidéo, suivi éditorial et contenus utiles aux étudiants.",
    services_json: ["Gestion complète", "Prise vidéo", "Prise photo", "Montage", "Calendrier de publication", "Suivi des performances"],
    cover_image: profMedia[0],
    gallery_json: profMedia,
    video_url: "/uploads/projects/prof-amouz/effects.mp4",
    objective: "Transformer la vision pédagogique du Prof Amouz en contenus clairs, réguliers et faciles à comprendre pour les étudiants.",
    solution: "Cadrage du besoin, préparation des scripts, organisation de la captation, production photo/vidéo, montage vertical et suivi des publications selon les retours du professeur.",
    results: "Catalogue Education prêt à travailler depuis l'admin : publications prévues, exemples de formats, qualité vidéo et indicateurs de vues à suivre.",
    sections_json: [
      { title: "Compréhension de la vision pédagogique", text: "Le projet commence par un cadrage précis : objectifs de cours, ton souhaité, difficultés fréquentes des étudiants et exemples de contenus à clarifier.", media: [profMedia[0]] },
      { title: "Production photo et vidéo", text: "Chaque séance prépare plusieurs formats : capsules verticales, photos de contexte, extraits pédagogiques et contenus adaptés aux réseaux sociaux.", media: [profMedia[1], "/uploads/projects/prof-amouz/effects.mp4"] },
      { title: "Suivi et amélioration continue", text: "Après publication, les vues, la rétention et les retours étudiants guident les prochains sujets pour rester proche du besoin réel.", media: [profMedia[2]] },
    ],
    catalogue_json: catalogue({
      title: "Prof Amouz - de la vision pédagogique au contenu publié",
      summary: "Un cadre de présentation qui rassemble stratégie, production, exemples de contenus et indicateurs à suivre pour piloter le projet sans perdre la vision du professeur.",
      vision: "Comprendre la méthode du professeur, son style d'explication et les notions qu'il veut transmettre avant de produire le moindre contenu.",
      audience: "Aider les étudiants à réviser plus vite, revoir les points difficiles et accéder à des formats courts, clairs et réguliers.",
      metrics: [
        { label: "Publications prévues", value: "24", detail: "capsules, reels, photos et rappels pédagogiques" },
        { label: "Formats de contenu", value: "4", detail: "cours court, extrait, photo, rappel avant examen" },
        { label: "Vues à suivre", value: "KPI", detail: "taux de vues, rétention et sujets les plus regardés" },
        { label: "Qualité vidéo", value: "4K", detail: "image nette, cadrage stable, audio propre" },
      ],
      workflow: standardWorkflow("éducative"),
      examples: [
        { title: "Capsule notion clé", format: "Vidéo verticale 60-90s", description: "Une explication courte d'un point difficile, pensée pour être revue rapidement par les étudiants.", proof: "Script + tournage + sous-titres" },
        { title: "Rappel avant examen", format: "Reel pédagogique", description: "Un résumé des erreurs fréquentes pour guider l'étudiant vers la bonne méthode.", proof: "Montage dynamique + appel à révision" },
        { title: "Photo de séance", format: "Photo éditoriale", description: "Des photos propres du professeur, du tableau et de l'ambiance d'apprentissage.", proof: "Sélection + retouche + format réseaux" },
      ],
      quality: ["Cadrage lisible sur mobile", "Audio clair pour chaque explication", "Sous-titres courts pour les passages importants", "Habillage cohérent avec l'image du professeur", "Reporting simple : publications, vues, rétention et retours"],
    }),
    testimonial_quote: "Note de cadrage : respecter la vision du professeur tout en rendant le contenu plus clair, régulier et utile aux étudiants.",
    testimonial_author: "Prestigia Agency - catalogue Education",
    meta_title: "Catalogue Education Prof Amouz | Prestigia Agency",
    meta_description: "Catalogue Education Prof Amouz : gestion complète, prise vidéo et photo, suivi éditorial, vision pédagogique et besoins étudiants.",
  },
  {
    id: "e6ba022a-ddf4-48e9-9959-f74dae486415",
    slug: "yahya-holding",
    title: "Yahya Holding",
    client_name: "Yahya Holding",
    category: "Immobilier",
    sector: "Immobilier",
    featured: true,
    description: "Accompagnement immobilier premium : stratégie digitale, contenus terrain, photo, vidéo, drone et présence web cohérente pour valoriser des projets de prestige.",
    services_json: ["Stratégie digitale", "Création de contenu", "Photographie professionnelle", "Vidéo & Drone", "Refonte de site web"],
    cover_image: media.yahya[0],
    gallery_json: media.yahya.slice(1),
    video_url: "",
    objective: "Construire une présence digitale immobilière crédible, élégante et capable de convertir l'intérêt en demandes qualifiées.",
    solution: "Positionnement de marque, bibliothèque photo/vidéo, pages projets, contenus réseaux sociaux et système de suivi des contacts entrants.",
    results: "Catalogue immobilier prêt à piloter : formats premium, indicateurs de visibilité, contenus de preuve et parcours de demande de devis.",
    sections_json: [
      { title: "Architecture de marque", text: "Clarification du positionnement, du ton et des messages qui donnent de la valeur au projet immobilier.", media: [media.yahya[0]] },
      { title: "Production terrain", text: "Photos, vidéos courtes et angles de mise en scène pour montrer les volumes, les finitions et le style de vie.", media: [media.yahya[1], media.yahya[2]] },
      { title: "Conversion digitale", text: "Organisation des contenus pour guider le visiteur vers la demande de visite ou de devis.", media: [media.yahya[3]] },
    ],
    catalogue_json: catalogue({
      title: "Yahya Holding - signature digitale immobilière",
      summary: "Un catalogue qui relie image premium, contenu de preuve et parcours de conversion pour présenter chaque projet immobilier avec plus de valeur.",
      vision: "Faire ressentir la qualité du bien avant la visite : architecture, lumière, emplacement, finitions et confiance du promoteur.",
      audience: "Acheteurs, investisseurs et prospects haut de gamme qui veulent comprendre vite la valeur du projet.",
      metrics: baseMetrics("Premium", "18"),
      workflow: standardWorkflow("immobilière"),
      examples: [
        { title: "Visite visuelle du projet", format: "Reel immobilier", description: "Un format vertical qui montre façade, intérieur, lumière et détails différenciants.", proof: "Storyboard + sélection des plans" },
        { title: "Carrousel détails", format: "Post galerie", description: "Une série de visuels pour expliquer les finitions, surfaces et arguments de valeur.", proof: "Photo + légendes commerciales" },
        { title: "Page projet", format: "Landing projet", description: "Une page claire pour regrouper image, description, arguments et contact.", proof: "Structure UX + contenu" },
      ],
      quality: ["Images lumineuses et non génériques", "Plans larges pour comprendre les volumes", "Arguments centrés sur la valeur du bien", "CTA de visite ou devis visible", "Suivi des leads par source"],
    }),
    testimonial_quote: "Note de cadrage : valoriser le projet avec une image premium et un parcours simple vers la prise de contact.",
    testimonial_author: "Prestigia Agency - catalogue Immobilier",
    meta_title: "Yahya Holding | Catalogue immobilier digital",
    meta_description: "Catalogue digital Yahya Holding : stratégie immobilière, contenus premium, photo, vidéo, site web et suivi des demandes qualifiées.",
  },
  {
    id: "5ce8020c-d569-4eb3-b8e8-5474b801a1f4",
    slug: "residence-atlas-garden-showcase-digital",
    title: "Résidence Atlas Garden",
    client_name: "Atlas Garden",
    category: "Immobilier",
    sector: "Immobilier",
    featured: false,
    description: "Catalogue immobilier pour présenter une résidence moderne avec contenus visuels, arguments de vente et parcours de contact clair.",
    services_json: ["Positionnement projet", "Photo immobilière", "Vidéo courte", "Landing page", "Campagne réseaux sociaux"],
    cover_image: media.atlas[0],
    gallery_json: media.atlas,
    video_url: "",
    objective: "Créer une présentation digitale claire pour aider les prospects à comprendre le style, les atouts et les prochaines étapes de contact.",
    solution: "Catalogue de contenus : images principales, textes commerciaux, posts de lancement, arguments par cible et suivi des demandes.",
    results: "Base de travail prête dans l'admin pour ajuster les visuels, les surfaces, les offres et les indicateurs de performance.",
    sections_json: [
      { title: "Mise en valeur du bien", text: "Sélection des angles qui montrent les volumes, la lumière et la qualité perçue de la résidence.", media: [media.atlas[0]] },
      { title: "Arguments commerciaux", text: "Organisation des messages par besoin : confort, localisation, investissement et style de vie.", media: [media.atlas[1]] },
      { title: "Parcours de contact", text: "CTA, page projet et contenus courts pour transformer l'intérêt en demande de visite.", media: [media.atlas[2]] },
    ],
    catalogue_json: catalogue({
      title: "Résidence Atlas Garden - lancement digital immobilier",
      summary: "Un catalogue prêt à éditer pour organiser les contenus de lancement, les visuels de preuve et les indicateurs de demandes.",
      vision: "Présenter la résidence comme un lieu concret et désirable, pas seulement comme une fiche descriptive.",
      audience: "Familles, investisseurs et prospects locaux qui veulent rapidement comprendre le bénéfice du projet.",
      metrics: baseMetrics("Premium", "16"),
      workflow: standardWorkflow("immobilière"),
      examples: [
        { title: "Annonce de lancement", format: "Carrousel Instagram", description: "Une introduction claire du projet, des atouts principaux et du contact.", proof: "Visuels + texte court" },
        { title: "Visite courte", format: "Reel 30-45s", description: "Un montage vertical pour donner une première sensation de visite.", proof: "Plans façade + intérieur" },
        { title: "Fiche projet", format: "Section site web", description: "Un bloc structuré avec emplacement, avantages et demande de visite.", proof: "UX + contenu" },
      ],
      quality: ["Photos nettes et lumineuses", "Promesse claire dès le premier écran", "Arguments simples par cible", "Bouton de contact visible", "Suivi des demandes par canal"],
    }),
    testimonial_quote: "Note de cadrage : transformer une résidence en histoire visuelle claire, prête à publier et à mesurer.",
    testimonial_author: "Prestigia Agency - catalogue Immobilier",
    meta_title: "Résidence Atlas Garden | Catalogue immobilier",
    meta_description: "Catalogue digital Résidence Atlas Garden : photo, vidéo, landing page, réseaux sociaux et suivi des demandes immobilières.",
  },
  {
    id: "0f1eded8-f742-4614-a36f-438c52ebfa11",
    slug: "villa-majorelle-contenu-immobilier",
    title: "Villa Majorelle",
    client_name: "Villa Majorelle",
    category: "Immobilier",
    sector: "Immobilier",
    featured: false,
    description: "Catalogue de contenu immobilier pour donner à une villa premium une présentation digitale plus élégante et plus convaincante.",
    services_json: ["Direction artistique", "Shooting photo", "Reels immobilier", "Retouche", "Argumentaire de vente"],
    cover_image: media.villa[0],
    gallery_json: media.villa,
    video_url: "",
    objective: "Créer une image digitale premium capable de montrer le standing du bien et de guider vers une prise de contact qualifiée.",
    solution: "Direction de shooting, formats courts, carrousels de détails, textes de valeur et structure de fiche immobilière.",
    results: "Catalogue éditable pour remplacer les visuels, préciser les informations du bien et suivre les contenus les plus efficaces.",
    sections_json: [
      { title: "Ambiance premium", text: "Mise en avant de la lumière, des matières et du style de vie autour du bien.", media: [media.villa[0]] },
      { title: "Détails qui vendent", text: "Focus sur les finitions, les espaces clés et les arguments qui justifient le niveau de standing.", media: [media.villa[1]] },
      { title: "Contenu court", text: "Déclinaison en formats verticaux et galeries pour réseaux sociaux.", media: [media.villa[2]] },
    ],
    catalogue_json: catalogue({
      title: "Villa Majorelle - contenu premium pour bien de prestige",
      summary: "Un catalogue orienté image haut de gamme, détails de valeur et conversion vers la prise de contact.",
      vision: "Faire ressentir le standing du bien à travers des visuels précis, sobres et crédibles.",
      audience: "Acheteurs premium, investisseurs et agences qui attendent une présentation claire et soignée.",
      metrics: baseMetrics("Premium", "14"),
      workflow: standardWorkflow("immobilière premium"),
      examples: [
        { title: "Détails architecturaux", format: "Carrousel photo", description: "Une galerie qui montre matériaux, volumes et finitions.", proof: "Shooting + retouche" },
        { title: "Reel ambiance", format: "Vidéo verticale", description: "Un montage fluide pour donner une première impression du bien.", proof: "Plan de tournage + montage" },
        { title: "Argumentaire premium", format: "Texte fiche projet", description: "Des textes courts pour expliquer le prix, le lieu et la rareté du bien.", proof: "Copywriting immobilier" },
      ],
      quality: ["Cadrage premium sans surcharge", "Retouche naturelle", "Messages courts et précis", "Galeries prêtes pour social media", "Indicateurs de demandes suivis"],
    }),
    testimonial_quote: "Note de cadrage : présenter le bien avec calme, précision et confiance.",
    testimonial_author: "Prestigia Agency - catalogue Immobilier",
    meta_title: "Villa Majorelle | Contenu immobilier premium",
    meta_description: "Catalogue Villa Majorelle : shooting photo, reels immobilier, argumentaire de vente et présentation digitale premium.",
  },
  {
    id: "a815e9ee-1641-44eb-99bf-8b3a2547726d",
    slug: "orion-residences-lancement-programme",
    title: "Orion Résidences",
    client_name: "Orion Résidences",
    category: "Immobilier",
    sector: "Immobilier",
    featured: false,
    description: "Catalogue de lancement pour un programme immobilier : identité de campagne, contenu social, page projet et suivi des prospects.",
    services_json: ["Campagne de lancement", "Contenu social", "Page projet", "Photo / Vidéo", "Suivi des leads"],
    cover_image: media.orion[0],
    gallery_json: media.orion,
    video_url: "",
    objective: "Structurer un lancement immobilier avec des messages clairs, des visuels cohérents et une lecture simple des demandes générées.",
    solution: "Plan de contenu par phase : teasing, présentation, preuve, questions fréquentes et relance des prospects.",
    results: "Catalogue de campagne prêt dans l'admin avec contenus, indicateurs et exemples de publications à adapter.",
    sections_json: [
      { title: "Phase teasing", text: "Créer l'attente avec des visuels courts, un message simple et un angle de différenciation.", media: [media.orion[0]] },
      { title: "Phase présentation", text: "Expliquer le projet, ses avantages, son emplacement et les raisons de demander plus d'informations.", media: [media.orion[1]] },
      { title: "Phase conversion", text: "Transformer les interactions en demandes qualifiées avec CTA, formulaire et suivi des sources.", media: [media.orion[2]] },
    ],
    catalogue_json: catalogue({
      title: "Orion Résidences - campagne de lancement immobilier",
      summary: "Un catalogue de campagne pour passer du teasing à la demande de visite avec des contenus cohérents et mesurables.",
      vision: "Construire une progression claire : découverte, confiance, intérêt, contact.",
      audience: "Prospects immobiliers qui comparent plusieurs projets et ont besoin d'arguments visibles rapidement.",
      metrics: baseMetrics("Lancement", "20"),
      workflow: standardWorkflow("de lancement immobilier"),
      examples: [
        { title: "Teasing projet", format: "Story + post", description: "Un premier message visuel pour annoncer le programme.", proof: "Concept + visuel" },
        { title: "Arguments clés", format: "Carrousel", description: "Une série pour expliquer emplacement, finitions et avantages.", proof: "Copy + design" },
        { title: "Relance prospects", format: "Post FAQ", description: "Répondre aux questions fréquentes pour réduire l'hésitation.", proof: "FAQ + CTA" },
      ],
      quality: ["Calendrier clair par phase", "Messages adaptés à chaque niveau d'intérêt", "Visuels cohérents entre site et social", "Formulaire ou WhatsApp visible", "Suivi par source de lead"],
    }),
    testimonial_quote: "Note de cadrage : donner au lancement une structure claire, puis mesurer ce qui déclenche les demandes.",
    testimonial_author: "Prestigia Agency - catalogue Immobilier",
    meta_title: "Orion Résidences | Campagne lancement immobilier",
    meta_description: "Catalogue Orion Résidences : lancement immobilier, contenu social, page projet, photo, vidéo et suivi des leads.",
  },
  {
    id: "a36d127e-48a9-4151-8100-53791994676e",
    slug: "maison-lina-lancement-restaurant",
    title: "Maison Lina",
    client_name: "Maison Lina",
    category: "Restauration",
    sector: "Restauration",
    featured: false,
    description: "Catalogue restauration pour lancer une adresse avec photos appétissantes, reels cuisine, menus clairs et calendrier de publication.",
    services_json: ["Shooting culinaire", "Reels Instagram", "Menu digital", "Community management", "Campagne de lancement"],
    cover_image: media.restaurant[0],
    gallery_json: media.restaurant,
    video_url: "",
    objective: "Présenter l'ambiance, les plats et l'expérience client de façon claire pour attirer les premières visites et réservations.",
    solution: "Direction photo culinaire, formats reels, contenus menu, stories, offres de lancement et suivi des vues/réservations.",
    results: "Catalogue prêt à éditer : plats à mettre en avant, formats de contenu, planning et indicateurs de vues/réservations.",
    sections_json: [
      { title: "Ambiance et appétit", text: "Créer des visuels qui donnent envie : lumière, textures, dressage et moments de service.", media: [media.restaurant[0], media.restaurant[1]] },
      { title: "Formats réseaux sociaux", text: "Décliner les plats en reels, stories, carrousels menu et contenus de lancement.", media: [media.restaurant[2]] },
      { title: "Suivi des réservations", text: "Lire les vues, messages, clics et demandes pour ajuster les plats et offres mis en avant.", media: [media.restaurant[3]] },
    ],
    catalogue_json: catalogue({
      title: "Maison Lina - lancement digital restauration",
      summary: "Un catalogue pour transformer les plats, l'ambiance et les offres en contenus simples à publier et à mesurer.",
      vision: "Faire ressentir le goût et l'ambiance avant la visite, avec des formats courts qui donnent envie de réserver.",
      audience: "Clients locaux, familles, groupes d'amis et visiteurs qui choisissent une adresse depuis Instagram ou Google.",
      metrics: baseMetrics("Culinaire", "22"),
      workflow: standardWorkflow("restauration"),
      examples: [
        { title: "Plat signature", format: "Reel cuisine", description: "Un format vertical qui montre préparation, texture et résultat final.", proof: "Tournage cuisine + montage" },
        { title: "Menu clair", format: "Carrousel", description: "Une lecture simple des plats phares, prix ou formules.", proof: "Design menu + photo" },
        { title: "Offre de lancement", format: "Story + post", description: "Un message direct pour générer visites, messages et réservations.", proof: "Copy + visuel" },
      ],
      quality: ["Photos appétissantes et lumineuses", "Vidéo verticale adaptée Reels", "Menu lisible sur mobile", "CTA réservation visible", "Suivi messages, clics et vues"],
    }),
    testimonial_quote: "Note de cadrage : rendre les plats désirables et transformer l'attention en réservation.",
    testimonial_author: "Prestigia Agency - catalogue Restauration",
    meta_title: "Maison Lina | Catalogue lancement restaurant",
    meta_description: "Catalogue Maison Lina : shooting culinaire, reels Instagram, menu digital, community management et suivi des réservations.",
  },
  {
    id: "bfa801a0-6b22-4fe7-9c42-37c5ab951e7e",
    slug: "urban-fit-academy-campagne-sport",
    title: "Urban Fit Academy",
    client_name: "Urban Fit Academy",
    category: "Sport",
    sector: "Sport",
    featured: false,
    description: "Catalogue sport pour présenter une académie ou salle avec énergie, preuves terrain, formats courts et suivi des inscriptions.",
    services_json: ["Stratégie contenu", "Photo sportive", "Reels entraînement", "Campagne inscriptions", "Reporting social"],
    cover_image: media.sport[0],
    gallery_json: media.sport,
    video_url: "",
    objective: "Montrer l'énergie des séances, rassurer les futurs inscrits et transformer les vues en demandes d'essai ou inscriptions.",
    solution: "Calendrier éditorial, captation terrain, portraits coachs, vidéos d'exercices, contenus preuve et CTA inscription.",
    results: "Catalogue prêt à ajuster depuis l'admin : formats sportifs, contenus de preuve, indicateurs de vues et demandes d'essai.",
    sections_json: [
      { title: "Énergie terrain", text: "Capturer l'intensité, la progression et l'ambiance des séances.", media: [media.sport[0], media.sport[1]] },
      { title: "Preuve et confiance", text: "Présenter coachs, méthode, niveaux, sécurité et bénéfices pour les pratiquants.", media: [media.sport[2]] },
      { title: "Inscription", text: "Organiser les contenus pour guider vers essai gratuit, WhatsApp ou formulaire.", media: [media.sport[3]] },
    ],
    catalogue_json: catalogue({
      title: "Urban Fit Academy - campagne sport et inscriptions",
      summary: "Un catalogue qui transforme l'énergie des entraînements en contenus courts, rassurants et orientés inscription.",
      vision: "Montrer que le lieu est actif, sérieux et accessible, avec une vraie ambiance de progression.",
      audience: "Débutants, sportifs réguliers, parents ou jeunes qui veulent comprendre le niveau et l'ambiance avant de s'inscrire.",
      metrics: baseMetrics("Dynamique", "20"),
      workflow: standardWorkflow("sportive"),
      examples: [
        { title: "Séance signature", format: "Reel entraînement", description: "Un montage court qui montre rythme, coach et ambiance.", proof: "Tournage + montage vertical" },
        { title: "Portrait coach", format: "Post photo + texte", description: "Un contenu pour créer confiance et expliquer la méthode.", proof: "Photo + copywriting" },
        { title: "Semaine d'essai", format: "Campagne social", description: "Un message simple pour générer demandes d'essai.", proof: "Visuel + CTA" },
      ],
      quality: ["Mouvement lisible et bien cadré", "Ton motivant mais crédible", "CTA inscription visible", "Formats adaptés Reels", "Suivi des demandes d'essai"],
    }),
    testimonial_quote: "Note de cadrage : montrer l'énergie réelle du terrain et simplifier le passage vers l'inscription.",
    testimonial_author: "Prestigia Agency - catalogue Sport",
    meta_title: "Urban Fit Academy | Catalogue sport digital",
    meta_description: "Catalogue Urban Fit Academy : photo sportive, reels entraînement, campagne inscriptions et reporting social.",
  },
  {
    id: "2a3098f1-c5ce-4d9f-89dc-b2dc4fef15ed",
    slug: "clinique-nova-care-presence-digitale",
    title: "Clinique Nova Care",
    client_name: "Clinique Nova Care",
    category: "Santé",
    sector: "Santé",
    featured: false,
    description: "Catalogue santé pour présenter un établissement avec sérieux, pédagogie, confiance visuelle et parcours de prise de rendez-vous.",
    services_json: ["Stratégie de confiance", "Photo établissement", "Contenu pédagogique", "Site vitrine", "Suivi rendez-vous"],
    cover_image: media.health[0],
    gallery_json: media.health,
    video_url: "",
    objective: "Rassurer les patients, expliquer les services clairement et faciliter la prise de rendez-vous depuis les canaux digitaux.",
    solution: "Contenus pédagogiques, photos propres, présentation des services, FAQ, page de contact et indicateurs de demandes.",
    results: "Catalogue prêt à modifier : messages patients, visuels, services prioritaires et indicateurs de prise de contact.",
    sections_json: [
      { title: "Confiance visuelle", text: "Présenter les espaces, l'accueil et l'équipe avec un rendu propre, sobre et rassurant.", media: [media.health[0], media.health[1]] },
      { title: "Pédagogie patient", text: "Expliquer les services, les étapes et les réponses aux questions fréquentes sans jargon.", media: [media.health[2]] },
      { title: "Rendez-vous", text: "Créer un parcours simple vers téléphone, formulaire ou WhatsApp selon le besoin.", media: [media.health[3]] },
    ],
    catalogue_json: catalogue({
      title: "Clinique Nova Care - présence digitale santé",
      summary: "Un catalogue pensé pour associer confiance, clarté médicale et parcours de rendez-vous simple.",
      vision: "Créer une présence digitale rassurante, utile et claire pour des patients qui cherchent des réponses fiables.",
      audience: "Patients, familles et prospects qui veulent comprendre les services et contacter rapidement l'établissement.",
      metrics: baseMetrics("Confiance", "16"),
      workflow: standardWorkflow("santé"),
      examples: [
        { title: "Service expliqué", format: "Post pédagogique", description: "Un contenu court qui explique un service sans langage compliqué.", proof: "Texte clair + visuel sobre" },
        { title: "Présentation lieu", format: "Galerie photo", description: "Des images propres de l'accueil, des espaces et du parcours patient.", proof: "Shooting + sélection" },
        { title: "FAQ patient", format: "Section site", description: "Réponses aux questions fréquentes pour réduire l'hésitation.", proof: "Contenu + UX contact" },
      ],
      quality: ["Ton sérieux et rassurant", "Pas de promesse médicale exagérée", "Images sobres et propres", "Contact visible", "Suivi appels, formulaires et messages"],
    }),
    testimonial_quote: "Note de cadrage : inspirer confiance, expliquer simplement et faciliter la prise de rendez-vous.",
    testimonial_author: "Prestigia Agency - catalogue Santé",
    meta_title: "Clinique Nova Care | Catalogue digital santé",
    meta_description: "Catalogue Clinique Nova Care : stratégie de confiance, photo établissement, contenu pédagogique, site vitrine et rendez-vous.",
  },
];

function normalizeName(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

async function ensureEducationCategory() {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name")
    .eq("entity", "projects");

  if (error) throw error;

  const exists = (data || []).some((row) => normalizeName(row.name) === "education");
  if (!exists) {
    const { error: insertError } = await supabase
      .from("categories")
      .insert({ entity: "projects", name: "Éducation", order: 6, active: true });

    if (insertError) throw insertError;
  }
}

async function run() {
  await ensureEducationCategory();

  let updated = 0;
  for (const project of projects) {
    const { id, ...patch } = project;
    const { error } = await supabase
      .from("projects")
      .update({ ...patch, active: true })
      .eq("id", id);

    if (error) throw new Error(`${project.title}: ${error.message}`);
    updated += 1;
  }

  const { data, error } = await supabase
    .from("projects")
    .select("slug,title,category,sector,catalogue_json")
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  const missing = (data || []).filter((row) => !row.catalogue_json).map((row) => row.slug);
  console.log(JSON.stringify({ updated, missingCatalogue: missing, educationCategory: true }, null, 2));
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
