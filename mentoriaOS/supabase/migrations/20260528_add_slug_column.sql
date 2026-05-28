-- Migration: Add slug column to mentorados table
-- Date: 2026-05-28

-- Add slug column for unique, URL-friendly identifiers
ALTER TABLE mentorados ADD COLUMN slug TEXT UNIQUE;

-- Create index for performance on slug lookups
CREATE INDEX IF NOT EXISTS idx_mentorados_slug ON mentorados(slug);

-- Populate existing mentorados with slugs (generated from names)
-- Note: This will be done via application migration script
-- UPDATE mentorados SET slug = LOWER(REPLACE(REPLACE(REPLACE(nome, ' ', '-'), 'á', 'a'), 'é', 'e'))
-- WHERE slug IS NULL;

-- After populating, set NOT NULL constraint
-- ALTER TABLE mentorados ALTER COLUMN slug SET NOT NULL;
