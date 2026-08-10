-- =====================================================
-- PRESTIGIA AGENCY - Project categories linking
-- Apply in Supabase Dashboard -> SQL Editor.
--
-- Goal:
-- 1. Ensure the categories table exists.
-- 2. Add projects.category_id as a real FK to categories.id.
-- 3. Keep legacy text fields category/sector compatible with the admin.
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity     text NOT NULL,
  name       text NOT NULL,
  "order"    integer DEFAULT 0,
  active     boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read categories" ON categories;
CREATE POLICY "public read categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "service_role all categories" ON categories;
CREATE POLICY "service_role all categories"
  ON categories FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

WITH defaults(entity, name, sort_order) AS (
  VALUES
    ('projects', 'Immobilier', 1),
    ('projects', 'Sport', 2),
    ('projects', 'Sante', 3),
    ('projects', 'Restauration', 4),
    ('projects', 'Video', 5),
    ('projects', 'BTP', 6),
    ('projects', 'E-commerce', 7),
    ('projects', 'Education', 8)
)
INSERT INTO categories (entity, name, "order", active)
SELECT defaults.entity, defaults.name, defaults.sort_order, true
FROM defaults
WHERE NOT EXISTS (
  SELECT 1
  FROM categories c
  WHERE c.entity = defaults.entity
    AND lower(trim(c.name)) = lower(trim(defaults.name))
);

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_category_id ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_entity_active_order ON categories(entity, active, "order");

CREATE OR REPLACE FUNCTION sync_project_category_link()
RETURNS trigger AS $$
DECLARE
  matched_id uuid;
  matched_name text;
BEGIN
  SELECT c.id, c.name
    INTO matched_id, matched_name
  FROM categories c
  WHERE c.entity = 'projects'
    AND c.active = true
    AND (
      lower(trim(c.name)) = lower(trim(coalesce(NEW.category, '')))
      OR lower(trim(c.name)) = lower(trim(coalesce(NEW.sector, '')))
    )
  ORDER BY c."order" NULLS LAST, c.name
  LIMIT 1;

  IF NEW.category_id IS NULL AND matched_id IS NOT NULL THEN
    NEW.category_id := matched_id;
  END IF;

  IF NEW.category_id IS NOT NULL THEN
    SELECT c.name
      INTO matched_name
    FROM categories c
    WHERE c.id = NEW.category_id;

    IF matched_name IS NOT NULL THEN
      IF coalesce(trim(NEW.category), '') = '' THEN
        NEW.category := matched_name;
      END IF;

      IF coalesce(trim(NEW.sector), '') = '' THEN
        NEW.sector := matched_name;
      END IF;
    END IF;
  ELSIF coalesce(trim(NEW.category), '') <> '' AND coalesce(trim(NEW.sector), '') = '' THEN
    NEW.sector := NEW.category;
  ELSIF coalesce(trim(NEW.sector), '') <> '' AND coalesce(trim(NEW.category), '') = '' THEN
    NEW.category := NEW.sector;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_category_link ON projects;
CREATE TRIGGER trg_projects_category_link
  BEFORE INSERT OR UPDATE OF category, sector, category_id ON projects
  FOR EACH ROW EXECUTE FUNCTION sync_project_category_link();

UPDATE projects
SET
  category = coalesce(nullif(category, ''), nullif(sector, ''), category),
  sector = coalesce(nullif(sector, ''), nullif(category, ''), sector)
WHERE category_id IS NULL
  OR coalesce(category, '') = ''
  OR coalesce(sector, '') = '';
