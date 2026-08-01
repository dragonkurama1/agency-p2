-- =====================================================
-- SEED PAGES + SETTINGS + SEO KEYWORDS + SECTIONS
-- À coller dans : Supabase Dashboard → SQL Editor → New query
-- =====================================================

-- ─── Bucket media : autoriser les vidéos + augmenter la taille ────────────
UPDATE storage.buckets SET
  file_size_limit  = 104857600,  -- 100 Mo
  allowed_mime_types = ARRAY[
    'image/jpeg','image/png','image/webp','image/gif','image/svg+xml',
    'video/mp4','video/webm','video/ogg','video/quicktime','video/x-msvideo'
  ]
WHERE id = 'media';

-- ─── SETTINGS (coordonnées correctes) ─────────────────
INSERT INTO settings (key, value, type) VALUES
  ('site_name',        'Prestigia Agency',                          'text'),
  ('site_email',       'contact@prestigia-agency.com',              'text'),
  ('site_phone',       '+212719144144',                             'text'),
  ('site_phone_display','+212 719 144-144',                         'text'),
  ('site_address',     'Bld Qods, The Gold Center, Étage 1, Bureau 2, Ain Chock, Casablanca', 'text'),
  ('site_city',        'Casablanca',                                'text'),
  ('site_country',     'Maroc',                                     'text'),
  ('whatsapp_url',     'https://wa.me/212719144144',                'text'),
  ('instagram_url',    'https://instagram.com/prestigia_agency',    'text'),
  ('linkedin_url',     'https://www.linkedin.com/company/prestigia-agency', 'text'),
  ('facebook_url',     'https://facebook.com/prestigiaagency',      'text'),
  ('tiktok_url',       '',                                          'text'),
  ('google_analytics', '',                                          'text'),
  ('hours_weekdays',   'Lundi - Vendredi : 9h00 - 18h00',           'text'),
  ('hours_saturday',   'Samedi : 10h00 - 14h00',                    'text')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ─── PAGES (chaque page du site) ──────────────────────
INSERT INTO pages (slug, title, subtitle, meta_title, meta_description, status) VALUES

('home',
 'Agence Marketing Digital à Casablanca',
 'Stratégie, création et performance pour faire grandir votre marque',
 'Prestigia Agency — Agence Marketing Digital Casablanca',
 'Agence marketing digital à Casablanca : SEO, publicité, branding, création de contenu, développement web et stratégie pour PME marocaines.',
 'published'),

('services',
 'Nos Services',
 'De la stratégie à la création, tous les leviers digitaux réunis',
 'Services Marketing Digital — Prestigia Agency Casablanca',
 'Découvrez tous nos services : SEO, Google Ads, Meta Ads, community management, création de contenu, branding, développement web et stratégie digitale.',
 'published'),

('realisations',
 'Nos Réalisations',
 'Projets concrets, résultats mesurables',
 'Réalisations & Portfolio — Prestigia Agency',
 'Découvrez nos projets clients : refonte digitale, SEO, branding, création de contenu et publicité pour des entreprises marocaines.',
 'published'),

('fondateurs',
 'Les Fondateurs',
 'Une équipe complémentaire au service de votre croissance',
 'Équipe Fondateurs — Prestigia Agency',
 'Rencontrez Abdelkader Naim et Ahmed Ghiwane, co-fondateurs de Prestigia Agency, votre agence digitale à Casablanca.',
 'published'),

('partenaires',
 'Nos Partenaires',
 'Ils nous font confiance pour leur stratégie digitale',
 'Partenaires — Prestigia Agency Casablanca',
 'Découvrez les entreprises partenaires de Prestigia Agency : Smetec, Arena Ville Verte, Barça Academy Maroc, Platima et bien d''autres.',
 'published'),

('blog',
 'Blog',
 'Conseils, guides et actualités marketing digital',
 'Blog Marketing Digital — Prestigia Agency',
 'Articles et guides sur le marketing digital au Maroc : SEO, publicité, branding, réseaux sociaux et création de contenu par les experts de Prestigia Agency.',
 'published'),

('contact',
 'Contactez-nous',
 'Discutons de votre projet',
 'Contact — Prestigia Agency Casablanca',
 'Contactez Prestigia Agency à Casablanca : téléphone, email, WhatsApp ou formulaire. Réponse sous 24h.',
 'published'),

('devis',
 'Demande de Devis',
 'Décrivez votre projet, nous vous revenons sous 24h',
 'Demande de Devis — Prestigia Agency',
 'Demandez un devis gratuit pour votre projet digital : site web, SEO, publicité, branding ou stratégie digitale au Maroc.',
 'published'),

('mentions-legales',
 'Mentions Légales',
 '',
 'Mentions Légales — Prestigia Agency',
 'Mentions légales de Prestigia Agency, agence de marketing digital à Casablanca.',
 'published'),

('confidentialite',
 'Politique de Confidentialité',
 '',
 'Politique de Confidentialité — Prestigia Agency',
 'Politique de confidentialité et protection des données personnelles de Prestigia Agency.',
 'published')

ON CONFLICT (slug) DO UPDATE SET
  title            = EXCLUDED.title,
  subtitle         = EXCLUDED.subtitle,
  meta_title       = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description;

-- ─── SEO KEYWORDS (pages principales) ─────────────────
-- Nettoyage avant insert (pas de contrainte unique sur page_slug)
DELETE FROM seo_keywords WHERE page_slug IN (
  'home','services','realisations','fondateurs','blog','contact','devis',
  'creation-site-web-casablanca','seo-referencement-naturel-maroc',
  'google-ads-meta-ads-maroc','community-management-casablanca',
  'creation-contenu-photo-video','branding-identite-visuelle',
  'automatisation-whatsapp-crm','strategie-digitale-pme-maroc',
  'agence-marketing-digital-casablanca','marketing-strategique'
);

INSERT INTO seo_keywords (page_slug, primary_keyword, secondary_keywords, search_intent, title_suggestion, description_suggestion) VALUES

('home',
 'agence marketing digital Casablanca',
 'agence digitale Casablanca, marketing digital Maroc, agence communication Casablanca',
 'Informationnelle / commerciale',
 'Prestigia Agency — Agence Marketing Digital à Casablanca',
 'Agence marketing digital à Casablanca : SEO, publicité, branding et création pour les entreprises marocaines.'),

('services',
 'services marketing digital Maroc',
 'agence SEO Casablanca, publicité Facebook Maroc, création contenu Maroc',
 'Commerciale',
 'Services Marketing Digital — Prestigia Agency Casablanca',
 'SEO, publicité, branding, contenu, développement web : tous les services digitaux pour votre croissance au Maroc.'),

('realisations',
 'portfolio agence digitale Casablanca',
 'réalisations agence marketing Maroc, case studies digitaux',
 'Commerciale / évaluative',
 'Réalisations & Portfolio — Prestigia Agency',
 'Découvrez nos projets clients avec résultats mesurables : SEO, branding, publicité, site web.'),

('contact',
 'agence marketing digital Casablanca contact',
 'contacter agence digitale Maroc, devis marketing digital',
 'Transactionnelle',
 'Contact — Prestigia Agency Casablanca',
 'Contactez notre agence de marketing digital à Casablanca. Réponse sous 24h.'),

('devis',
 'devis agence marketing digital Maroc',
 'devis site web Casablanca, devis SEO Maroc, devis publicité digitale',
 'Transactionnelle',
 'Demande de Devis Gratuit — Prestigia Agency',
 'Obtenez un devis gratuit pour votre projet digital : site web, SEO, publicité ou stratégie.'),

('creation-site-web-casablanca',
 'création site web Casablanca',
 'création site web Maroc, développement site e-commerce Maroc, agence web Casablanca',
 'Transactionnelle',
 'Création de site web à Casablanca | Prestigia Agency',
 'Agence de création de site web à Casablanca : sites vitrines et e-commerce performants et optimisés SEO.'),

('seo-referencement-naturel-maroc',
 'agence SEO Casablanca',
 'référencement naturel Maroc, consultant SEO Casablanca, audit SEO Maroc',
 'Commerciale',
 'Agence SEO Casablanca — Référencement naturel Maroc | Prestigia Agency',
 'Expert SEO à Casablanca : audit technique, stratégie mots-clés et contenu pour un référencement durable.'),

('google-ads-meta-ads-maroc',
 'Google Ads Casablanca',
 'publicité Facebook Instagram Maroc, Meta Ads Maroc, campagne Google Ads Maroc',
 'Commerciale',
 'Agence Google Ads & Meta Ads Casablanca | Prestigia Agency',
 'Gestion de campagnes Google Ads et Meta Ads au Maroc : ciblage précis, ROAS maîtrisé.'),

('community-management-casablanca',
 'community management Casablanca',
 'agence social media Casablanca, gestion réseaux sociaux Maroc',
 'Commerciale',
 'Community Management à Casablanca | Prestigia Agency',
 'Stratégie et animation de vos réseaux sociaux à Casablanca : Instagram, Facebook, LinkedIn, TikTok.'),

('branding-identite-visuelle',
 'branding Casablanca',
 'création logo Maroc, identité visuelle entreprise Casablanca, charte graphique Maroc',
 'Commerciale',
 'Branding & Identité Visuelle à Casablanca | Prestigia Agency',
 'Création de logo, charte graphique et identité de marque cohérente pour votre entreprise.');

-- ─── SECTIONS (blocs éditables par page) ─────────────────────────────────────
DELETE FROM sections WHERE page_slug IN ('home','services','realisations','fondateurs','partenaires','blog','contact','devis');

INSERT INTO sections (page_slug, section_key, title, subtitle, button_text, button_link, "order", active) VALUES
-- Accueil
('home', 'hero',
 'Nous construisons une présence digitale qui attire, engage et convertit.',
 'Stratégie, contenu, publicité, web et data réunis dans une approche orientée résultats.',
 'Demander un devis', '/devis', 1, true),
('home', 'cta',
 'Prêt à transformer votre présence digitale ?',
 'Discutons de votre projet et construisons ensemble une stratégie qui convertit.',
 'Demander un devis gratuit', '/devis', 2, true),

-- Services
('services', 'hero',
 'Tout ce qu''il faut pour développer votre présence digitale',
 'Dix expertises complémentaires, mobilisables séparément ou dans une stratégie globale.',
 null, null, 1, true),

-- Réalisations
('realisations', 'hero',
 'Nos réalisations',
 'Découvrez les projets que nous avons menés à bien pour nos clients.',
 null, null, 1, true),

-- Fondateurs
('fondateurs', 'hero',
 'Les fondateurs de Prestigia Agency',
 'Deux profils complémentaires, une même conviction : le digital doit produire des résultats mesurables.',
 null, null, 1, true),

-- Partenaires
('partenaires', 'hero',
 'Ils nous font confiance',
 'Des entreprises de toutes tailles nous confient leur stratégie digitale à Casablanca.',
 null, null, 1, true),

-- Blog
('blog', 'hero',
 'Conseils & guides marketing digital',
 'Ressources pratiques sur le SEO, la publicité, le branding et la stratégie digitale.',
 null, null, 1, true),

-- Contact
('contact', 'hero',
 'Parlons de votre projet',
 'Notre équipe est disponible pour répondre à vos questions et vous accompagner.',
 null, null, 1, true),

-- Devis
('devis', 'hero',
 'Demander un devis gratuit',
 'Décrivez votre projet en quelques minutes et recevez une proposition personnalisée.',
 null, null, 1, true);
