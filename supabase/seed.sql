-- =====================================================
-- SEED DATA — Prestigia Agency
-- À coller dans : Supabase Dashboard → SQL Editor → New query
-- =====================================================

-- Vider les tables avant d'insérer (évite les doublons si relancé)
TRUNCATE services, team, partners, testimonials, projects, blog_posts, faq RESTART IDENTITY CASCADE;

-- ─── SERVICES (10) ───────────────────────────────────
INSERT INTO services (slug, title, short_description, full_description, icon, meta_title, meta_description, keywords, advantages_json, process_json, faq_json, related_json, "order", active) VALUES

('creation-site-web-casablanca','Création de site web à Casablanca',
'Sites vitrines et e-commerce rapides, modernes, pensés pour convertir.',
'Nous concevons des sites web sur-mesure pour les PME et marques marocaines : architecture claire, design premium, performance technique et structure SEO dès la conception. Chaque site est pensé comme un outil commercial, pas seulement une vitrine.',
'Code2',
'Création de site web à Casablanca | Prestigia Agency',
'Agence de création de site web à Casablanca : sites vitrines et e-commerce rapides, modernes et optimisés pour la conversion et le référencement.',
'création site web Casablanca, création site web Maroc, développement site e-commerce Maroc',
'["Design premium sur-mesure","Performance et Core Web Vitals optimisés","Structure SEO intégrée dès le départ","Formation à la prise en main"]',
'["Audit & cahier des charges","Maquettage UX/UI","Développement & intégration","Mise en ligne & suivi"]',
'[{"question":"Combien de temps pour créer mon site ?","answer":"Comptez 3 à 6 semaines selon la complexité, de l''audit à la mise en ligne."},{"question":"Le site sera-t-il optimisé pour le SEO ?","answer":"Oui, la structure technique SEO est intégrée dès la conception."}]',
'["seo-referencement-naturel-maroc","branding-identite-visuelle"]',
1, true),

('seo-referencement-naturel-maroc','SEO & référencement naturel au Maroc',
'Une visibilité durable sur Google, sans dépendre de la publicité.',
'Notre approche SEO combine audit technique, stratégie de contenu et autorité de domaine pour positionner durablement votre site sur les recherches qui comptent pour votre activité, à Casablanca et au Maroc.',
'TrendingUp',
'Agence SEO Casablanca — Référencement naturel Maroc | Prestigia Agency',
'Consultant SEO à Casablanca : audit technique, stratégie de mots-clés et contenu pour améliorer durablement votre référencement naturel au Maroc.',
'agence SEO Casablanca, référencement naturel Maroc, consultant SEO Casablanca',
'["Audit technique complet","Stratégie de mots-clés locale et nationale","Contenu optimisé sans keyword stuffing","Reporting mensuel transparent"]',
'["Audit SEO initial","Stratégie de mots-clés","Optimisation technique & contenu","Suivi des positions & ajustements"]',
'[{"question":"En combien de temps voit-on des résultats SEO ?","answer":"Les premiers signaux apparaissent en 2-3 mois, les résultats significatifs en 6 mois selon la concurrence du secteur."}]',
'["creation-site-web-casablanca","strategie-digitale-pme-maroc"]',
2, true),

('google-ads-meta-ads-maroc','Google Ads & Meta Ads au Maroc',
'Des campagnes publicitaires pilotées par la donnée, pas par l''intuition.',
'Nous gérons vos campagnes Google Ads, Facebook et Instagram Ads avec un objectif clair : un coût d''acquisition maîtrisé et des leads qualifiés. Ciblage précis, créatifs testés, optimisation continue.',
'Megaphone',
'Agence Google Ads & Meta Ads Casablanca | Prestigia Agency',
'Gestion de campagnes Google Ads et Meta Ads au Maroc : ciblage précis, créatifs performants, suivi du ROAS et optimisation continue.',
'Google Ads Casablanca, publicité Facebook Instagram Maroc',
'["Ciblage par audience et lookalike","Création de visuels et copywriting publicitaire","Suivi du ROAS en temps réel","Tests A/B continus"]',
'["Définition des objectifs & budget","Setup tracking & pixels","Lancement & optimisation","Reporting de performance"]',
'[{"question":"Quel budget minimum pour démarrer ?","answer":"Un test initial est possible à partir de quelques milliers de dirhams par mois."}]',
'["community-management-casablanca","creation-contenu-photo-video"]',
3, true),

('community-management-casablanca','Community management à Casablanca',
'Une présence sociale cohérente qui engage votre audience.',
'Stratégie de contenu, planning éditorial, création de visuels et animation des communautés Instagram, Facebook, LinkedIn et TikTok pour construire une marque reconnue et engager une audience qualifiée.',
'Share2',
'Agence Social Media & Community Management Casablanca | Prestigia Agency',
'Community management à Casablanca : stratégie de contenu, création de visuels et animation de vos réseaux sociaux pour engager votre audience.',
'community management Casablanca, agence social media Casablanca',
'["Calendrier éditorial sur-mesure","Création graphique cohérente avec votre branding","Modération et relation communauté","Reporting d''engagement"]',
'["Audit des réseaux existants","Ligne éditoriale & charte","Production de contenu","Publication & animation"]',
'[{"question":"Sur quels réseaux travaillez-vous ?","answer":"Instagram, Facebook, LinkedIn et TikTok selon votre audience cible."}]',
'["creation-contenu-photo-video","google-ads-meta-ads-maroc"]',
4, true),

('creation-contenu-photo-video','Création de contenu photo & vidéo',
'Du contenu qui capte l''attention et raconte votre marque.',
'Shootings produits, vidéos de marque, UGC, motion design et vidéos assistées par IA : nous produisons le contenu visuel qui alimente vos réseaux sociaux, votre site et vos campagnes publicitaires.',
'Camera',
'Création de contenu photo & vidéo à Casablanca | Prestigia Agency',
'Production de contenu photo, vidéo, UGC et motion design à Casablanca pour alimenter vos réseaux sociaux et campagnes publicitaires.',
'création contenu vidéo Casablanca, UGC, motion design',
'["Shootings produits et corporate","Vidéos courtes optimisées réseaux sociaux","UGC et motion design","Vidéos assistées par IA"]',
'["Brief créatif","Scénarisation & shooting","Montage & post-production","Livraison multi-format"]',
'[{"question":"Fournissez-vous le matériel de shooting ?","answer":"Oui, équipe et matériel professionnel inclus, sur site ou en studio."}]',
'["community-management-casablanca","branding-identite-visuelle"]',
5, true),

('branding-identite-visuelle','Branding & identité visuelle',
'Une identité de marque forte, cohérente sur tous les points de contact.',
'Logo, charte graphique, ton de voix, supports de communication : nous construisons une identité de marque mémorable qui inspire confiance et différencie votre entreprise sur son marché.',
'Sparkles',
'Agence Branding & Identité Visuelle Casablanca | Prestigia Agency',
'Création de logo, charte graphique et identité de marque à Casablanca pour une présence cohérente et mémorable sur tous vos supports.',
'branding Casablanca',
'["Logo et système graphique complet","Charte de marque détaillée","Ton de voix et messaging","Déclinaison sur tous les supports"]',
'["Découverte de marque","Recherche & exploration créative","Création de l''identité","Livraison de la charte graphique"]',
'[{"question":"Le branding inclut-il le packaging ?","answer":"Oui si nécessaire, le packaging et les supports physiques peuvent être inclus sur devis."}]',
'["creation-site-web-casablanca","creation-contenu-photo-video"]',
6, true),

('automatisation-whatsapp-crm','Automatisation WhatsApp, CRM & leads',
'Ne perdez plus aucun lead : réponse instantanée et suivi automatisé.',
'Mise en place de chatbots WhatsApp, intégration CRM et workflows d''automatisation pour qualifier, relancer et convertir vos leads sans effort manuel supplémentaire.',
'Workflow',
'Automatisation WhatsApp & CRM Maroc | Prestigia Agency',
'Automatisation WhatsApp, intégration CRM et génération de leads au Maroc pour qualifier et convertir vos prospects automatiquement.',
'automatisation WhatsApp Maroc, génération de leads Maroc',
'["Chatbot WhatsApp Business API","Intégration CRM (HubSpot, Pipedrive...)","Scénarios de relance automatique","Suivi du pipeline commercial"]',
'["Cartographie du parcours client","Configuration des outils","Tests & mise en production","Formation de l''équipe"]',
'[{"question":"Faut-il un numéro WhatsApp Business dédié ?","answer":"Oui, nous vous accompagnons dans sa configuration si vous n''en avez pas encore."}]',
'["strategie-digitale-pme-maroc","google-ads-meta-ads-maroc"]',
7, true),

('strategie-digitale-pme-maroc','Stratégie digitale pour PME marocaines',
'Un plan d''action clair, priorisé selon vos objectifs et votre budget.',
'Nous accompagnons les PME marocaines dans la construction d''une feuille de route digitale complète : positionnement, choix des canaux, priorisation des actions et pilotage des résultats.',
'Compass',
'Stratégie Digitale pour PME au Maroc | Prestigia Agency',
'Accompagnement stratégique digital pour PME marocaines : positionnement, choix des canaux et plan d''action priorisé selon vos objectifs.',
'marketing digital PME Maroc, stratégie digitale entreprise',
'["Diagnostic 360° de votre présence digitale","Plan d''action priorisé et réaliste","Pilotage mensuel des résultats","Accompagnement sur la durée"]',
'["Audit & diagnostic","Définition des objectifs","Plan d''action","Pilotage & ajustements"]',
'[{"question":"Travaillez-vous avec des entrepreneurs individuels ?","answer":"Oui, notre accompagnement s''adapte aussi bien aux PME qu''aux indépendants et marques en croissance."}]',
'["seo-referencement-naturel-maroc","automatisation-whatsapp-crm"]',
8, true),

('agence-marketing-digital-casablanca','Agence marketing digital à Casablanca',
'Stratégie, contenu, publicité, web et data réunis dans une seule équipe.',
'Prestigia Agency est votre partenaire marketing digital à Casablanca : nous combinons stratégie, création, publicité et développement web dans une approche orientée résultats, pour les marques et PME qui veulent grandir.',
'LayoutGrid',
'Agence Marketing Digital à Casablanca | Prestigia Agency',
'Agence marketing digital à Casablanca : stratégie, contenu, publicité, web et data réunis pour faire grandir votre entreprise.',
'agence marketing digital Casablanca, agence digitale Casablanca',
'["Une équipe pluridisciplinaire","Une stratégie unifiée tous canaux","Des résultats mesurables","Un interlocuteur unique"]',
'["Audit","Stratégie","Création","Croissance"]',
'[{"question":"Travaillez-vous uniquement avec des entreprises à Casablanca ?","answer":"Nous accompagnons des clients partout au Maroc, avec une présence forte à Casablanca."}]',
'["seo-referencement-naturel-maroc","creation-site-web-casablanca"]',
9, true),

('marketing-strategique','Marketing stratégique',
'Des décisions marketing fondées sur la donnée, pas sur l''intuition.',
'Études de marché, positionnement, analyse concurrentielle et plans marketing : nous posons les fondations stratégiques sur lesquelles construire des actions digitales cohérentes et efficaces.',
'BarChart3',
'Marketing Stratégique Maroc | Prestigia Agency',
'Stratégie marketing fondée sur la donnée : positionnement, étude de marché et plan d''action pour les marques et entreprises au Maroc.',
'marketing stratégique digital',
'["Analyse de marché et concurrence","Positionnement de marque clair","Plan marketing actionnable","Indicateurs de pilotage définis"]',
'["Recherche & analyse","Positionnement","Plan stratégique","Mise en œuvre accompagnée"]',
'[{"question":"Cette prestation peut-elle précéder une refonte de site ou de branding ?","answer":"Oui, c''est même recommandé : la stratégie cadre les décisions créatives et digitales qui suivent."}]',
'["strategie-digitale-pme-maroc","branding-identite-visuelle"]',
10, true);

-- ─── TEAM (2) ────────────────────────────────────────
INSERT INTO team (name, role, bio, photo_url, linkedin, instagram, "order", active) VALUES
('Abdelkader Naim','Co-Founder & Développeur Informatique',
'Développement web & architecture. 5 ans d''expérience à construire des produits digitaux performants pour des marques marocaines.',
'','','',1,true),
('Ahmed Ghiwane','Co-Founder & Expert Digital',
'Shooting, stratégie digitale & performance. 6 ans d''expérience à piloter des campagnes qui transforment la visibilité en clients réels.',
'','','',2,true);

-- ─── PARTNERS (4) ────────────────────────────────────
INSERT INTO partners (name, logo_url, website, description, "order", active) VALUES
('Smetec','','','Aménagement sportif — conception et aménagement d''espaces sportifs.',1,true),
('Arena Ville Verte','','','Location de terrains multisports (Foot, Padel, Basket).',2,true),
('Barça Academy Maroc','','','Académie de football — centre de formation pour jeunes talents.',3,true),
('Platima','','','Matériaux de construction — acteur clé du BTP.',4,true);

-- ─── TESTIMONIALS (3) ────────────────────────────────
INSERT INTO testimonials (client_name, company, message, rating, service, active) VALUES
('Ahmed Ghiwane','Prestigia Agency',
'Le marketing digital n''est pas une dépense, c''est un investissement stratégique qui transforme les entreprises en champions de leur secteur.',
5,'Marketing Stratégique',true),
('Responsable Marketing','Arena Ville Verte',
'Une équipe réactive qui a structuré notre présence digitale et augmenté nos réservations en ligne en quelques mois.',
5,'Community Management',true),
('Direction Commerciale','Platima',
'Un site web professionnel et un référencement qui génère désormais des demandes qualifiées chaque semaine.',
5,'Développement Web & SEO',true);

-- ─── PROJECTS (3) ────────────────────────────────────
INSERT INTO projects (slug, title, client_name, category, sector, objective, solution, results, cover_image, active) VALUES
('arena-ville-verte-refonte-digitale','Refonte digitale — Arena Ville Verte',
'Arena Ville Verte','Site Web','Sport & loisirs',
'Digitaliser les réservations de terrains et renforcer la visibilité locale.',
'Nouveau site de réservation en ligne, SEO local et stratégie social media.',
'+65% de réservations en ligne en 4 mois, présence Google Maps optimisée.',
'',true),
('platima-generation-de-leads','Génération de leads B2B — Platima',
'Platima','SEO','BTP & matériaux de construction',
'Générer des demandes de devis qualifiées via le référencement naturel.',
'Refonte SEO du site, contenu spécialisé BTP, maillage interne.',
'x3 demandes de devis entrantes en 6 mois.',
'',true),
('barca-academy-maroc-branding','Identité de marque — Barça Academy Maroc',
'Barça Academy Maroc','Branding','Formation sportive',
'Créer une identité visuelle alignée avec un standard international.',
'Charte graphique complète, supports de communication, contenu photo/vidéo.',
'Identité déployée sur tous les supports en 6 semaines.',
'',true);

-- ─── BLOG POSTS (2) ──────────────────────────────────
INSERT INTO blog_posts (slug, title, excerpt, content, category, tags, author, faq_json, status, published_at) VALUES
('comment-choisir-agence-marketing-digital',
'Comment choisir une agence marketing digital — checklist complète',
'Guide complet pour sélectionner la meilleure agence marketing digital adaptée à votre entreprise.',
'Choisir une agence marketing digital est une décision stratégique. Voici les critères essentiels : expertise sectorielle, transparence des résultats, méthodologie claire et capacité à couvrir l''ensemble de vos besoins (stratégie, création, publicité, web).',
'Marketing Digital','Marketing Digital,Agence','Ahmed Ghiwane',
'[{"question":"Quel budget prévoir pour une agence digitale ?","answer":"Cela varie selon les services choisis ; un accompagnement structuré démarre généralement à partir de quelques milliers de dirhams par mois."}]',
'published','2025-01-18 00:00:00+00'),
('seo-local-casablanca-guide',
'SEO local à Casablanca : le guide pour apparaître sur Google Maps',
'Les leviers concrets pour améliorer votre visibilité locale à Casablanca.',
'Le SEO local repose sur trois piliers : une fiche Google Business Profile complète, une cohérence NAP (nom, adresse, téléphone) sur le web, et des avis clients réguliers.',
'SEO','SEO,Local','Abdelkader Naim',
'[]',
'published','2025-03-02 00:00:00+00');

-- ─── FAQ (homepage) ───────────────────────────────────
INSERT INTO faq (page_slug, question, answer, "order", active) VALUES
('home','Quels types d''entreprises accompagnez-vous ?',
'Des PME, marques et entrepreneurs à Casablanca et partout au Maroc, dans des secteurs variés : sport, BTP, retail, services.',1,true),
('home','Combien de temps avant de voir des résultats ?',
'Cela dépend du service : la publicité génère des résultats en quelques jours, le SEO en quelques mois. Nous fixons des attentes réalistes dès le départ.',2,true),
('home','Proposez-vous des forfaits mensuels ?',
'Oui, la plupart de nos prestations (SEO, social media, ads) fonctionnent en accompagnement mensuel avec engagement minimal.',3,true),
('home','Puis-je vous confier uniquement la création de mon site, sans accompagnement marketing ?',
'Bien sûr, chaque service est disponible indépendamment ou combiné dans une stratégie globale.',4,true);
