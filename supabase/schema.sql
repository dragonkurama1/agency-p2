-- =====================================================
-- PRESTIGIA AGENCY — Schema complet (16 tables)
-- Projet : nmshvimuahdepunoeeho
-- À coller dans : Supabase Dashboard → SQL Editor → New query
-- =====================================================

-- Fonction mise à jour automatique updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── 1. SERVICES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text UNIQUE NOT NULL,
  title            text NOT NULL,
  short_description text,
  full_description text,
  icon             text,
  image_url        text,
  meta_title       text,
  meta_description text,
  keywords         text,
  advantages_json  jsonb DEFAULT '[]',
  process_json     jsonb DEFAULT '[]',
  faq_json         jsonb DEFAULT '[]',
  related_json     jsonb DEFAULT '[]',
  "order"          integer DEFAULT 0,
  active           boolean DEFAULT true,
  updated_at       timestamptz DEFAULT now()
);
CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read services"   ON services FOR SELECT USING (true);
CREATE POLICY "service_role all services" ON services FOR ALL USING (auth.role() = 'service_role');

-- ─── 2. CATEGORIES ───────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity     text NOT NULL,
  name       text NOT NULL,
  "order"    integer DEFAULT 0,
  active     boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read categories" ON categories FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "service_role all categories" ON categories FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── 3. PROJECTS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text UNIQUE NOT NULL,
  title            text NOT NULL,
  client_name      text,
  category         text,
  sector           text,
  category_id      uuid REFERENCES categories(id) ON DELETE SET NULL,
  objective        text,
  solution         text,
  results          text,
  cover_image      text,
  gallery_json     jsonb DEFAULT '[]',
  video_url        text,
  meta_title       text,
  meta_description text,
  active           boolean DEFAULT true,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read projects"      ON projects FOR SELECT USING (true);
CREATE POLICY "service_role all projects" ON projects FOR ALL USING (auth.role() = 'service_role');

-- ─── 3. BLOG POSTS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text UNIQUE NOT NULL,
  title            text NOT NULL,
  excerpt          text,
  content          text,
  cover_image      text,
  category         text,
  tags             text,
  author           text DEFAULT 'Prestigia Agency',
  meta_title       text,
  meta_description text,
  faq_json         jsonb DEFAULT '[]',
  status           text DEFAULT 'published',
  published_at     timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);
CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read blog_posts"      ON blog_posts FOR SELECT USING (true);
CREATE POLICY "service_role all blog_posts" ON blog_posts FOR ALL USING (auth.role() = 'service_role');

-- ─── 4. TEAM ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  role       text,
  bio        text,
  photo_url  text,
  linkedin   text,
  instagram  text,
  "order"    integer DEFAULT 0,
  active     boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);
CREATE TRIGGER trg_team_updated_at
  BEFORE UPDATE ON team
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE team ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read team"      ON team FOR SELECT USING (true);
CREATE POLICY "service_role all team" ON team FOR ALL USING (auth.role() = 'service_role');

-- ─── 5. PARTNERS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS partners (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  logo_url    text,
  website     text,
  description text,
  "order"     integer DEFAULT 0,
  active      boolean DEFAULT true,
  updated_at  timestamptz DEFAULT now()
);
CREATE TRIGGER trg_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read partners"      ON partners FOR SELECT USING (true);
CREATE POLICY "service_role all partners" ON partners FOR ALL USING (auth.role() = 'service_role');

-- ─── 6. TESTIMONIALS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  company     text,
  message     text,
  rating      integer DEFAULT 5,
  photo_url   text,
  service     text,
  active      boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read testimonials"      ON testimonials FOR SELECT USING (true);
CREATE POLICY "service_role all testimonials" ON testimonials FOR ALL USING (auth.role() = 'service_role');

-- ─── 7. FAQ ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faq (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug  text NOT NULL,
  question   text NOT NULL,
  answer     text,
  "order"    integer DEFAULT 0,
  active     boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);
CREATE TRIGGER trg_faq_updated_at
  BEFORE UPDATE ON faq
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read faq"      ON faq FOR SELECT USING (true);
CREATE POLICY "service_role all faq" ON faq FOR ALL USING (auth.role() = 'service_role');

-- ─── 8. PAGES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text UNIQUE NOT NULL,
  title            text NOT NULL,
  subtitle         text,
  content          text,
  meta_title       text,
  meta_description text,
  og_image         text,
  status           text DEFAULT 'published',
  updated_at       timestamptz DEFAULT now()
);
CREATE TRIGGER trg_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read pages"      ON pages FOR SELECT USING (true);
CREATE POLICY "service_role all pages" ON pages FOR ALL USING (auth.role() = 'service_role');

-- ─── 9. SECTIONS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS sections (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug    text NOT NULL,
  section_key  text NOT NULL,
  title        text,
  subtitle     text,
  content      text,
  image_url    text,
  button_text  text,
  button_link  text,
  "order"      integer DEFAULT 0,
  active       boolean DEFAULT true,
  updated_at   timestamptz DEFAULT now(),
  UNIQUE (page_slug, section_key)
);
CREATE TRIGGER trg_sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read sections"      ON sections FOR SELECT USING (true);
CREATE POLICY "service_role all sections" ON sections FOR ALL USING (auth.role() = 'service_role');

-- ─── 10. MEDIA ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS media (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name   text NOT NULL,
  file_type   text,
  file_url    text NOT NULL,
  alt_text    text,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read media"      ON media FOR SELECT USING (true);
CREATE POLICY "service_role all media" ON media FOR ALL USING (auth.role() = 'service_role');

-- ─── 11. LEADS CONTACT ───────────────────────────────
CREATE TABLE IF NOT EXISTS leads_contact (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text,
  email       text,
  phone       text,
  company     text,
  message     text,
  source_page text,
  status      text DEFAULT 'new',
  notes       text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE leads_contact ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert leads_contact"      ON leads_contact FOR INSERT WITH CHECK (true);
CREATE POLICY "service_role all leads_contact"   ON leads_contact FOR ALL USING (auth.role() = 'service_role');

-- ─── 12. LEADS DEVIS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS leads_devis (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text,
  company             text,
  phone               text,
  email               text,
  city                text,
  website             text,
  social_links        text,
  selected_services   text,
  budget              text,
  timeline            text,
  objective           text,
  project_description text,
  file_url            text,
  status              text DEFAULT 'new',
  notes               text,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE leads_devis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert leads_devis"    ON leads_devis FOR INSERT WITH CHECK (true);
CREATE POLICY "service_role all leads_devis" ON leads_devis FOR ALL USING (auth.role() = 'service_role');

-- ─── 13. SEO KEYWORDS ────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_keywords (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug             text NOT NULL,
  primary_keyword       text,
  secondary_keywords    text,
  search_intent         text,
  title_suggestion      text,
  description_suggestion text,
  updated_at            timestamptz DEFAULT now()
);
CREATE TRIGGER trg_seo_keywords_updated_at
  BEFORE UPDATE ON seo_keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read seo_keywords"      ON seo_keywords FOR SELECT USING (true);
CREATE POLICY "service_role all seo_keywords" ON seo_keywords FOR ALL USING (auth.role() = 'service_role');

-- ─── 14. SETTINGS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key        text PRIMARY KEY,
  value      text,
  type       text DEFAULT 'text',
  updated_at timestamptz DEFAULT now()
);
CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings"      ON settings FOR SELECT USING (true);
CREATE POLICY "service_role all settings" ON settings FOR ALL USING (auth.role() = 'service_role');

-- ─── 15. AUDIT LOG ───────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text,
  action      text,
  entity_type text,
  entity_id   text,
  details     jsonb,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role all audit_log" ON audit_log FOR ALL USING (auth.role() = 'service_role');

-- ─── Storage bucket policies ──────────────────────────
-- Bucket "media" déjà créé via l'API — ajouter les policies :
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media', 'media', true, 5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read media bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "service_role upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND auth.role() = 'service_role');

CREATE POLICY "service_role delete media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND auth.role() = 'service_role');

-- ─── Données initiales settings ──────────────────────
INSERT INTO settings (key, value, type) VALUES
  ('site_name',        'Prestigia Agency',                  'text'),
  ('site_email',       'contact@prestigia-agency.com',      'text'),
  ('site_phone',       '+33 1 23 45 67 89',                 'text'),
  ('site_address',     'Paris, France',                     'text'),
  ('linkedin_url',     'https://linkedin.com/company/prestigia-agency', 'text'),
  ('instagram_url',    'https://instagram.com/prestigia.agency',        'text'),
  ('facebook_url',     '',                                  'text'),
  ('google_analytics', '',                                  'text')
ON CONFLICT (key) DO NOTHING;
