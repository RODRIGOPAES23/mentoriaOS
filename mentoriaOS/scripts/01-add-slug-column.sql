-- MIGRATION: Add slug column to mentorados table
-- Execute this in Supabase SQL Editor

-- Step 1: Add slug column (TEXT, nullable initially)
ALTER TABLE mentorados ADD COLUMN slug TEXT;

-- Step 2: Create index for performance
CREATE INDEX idx_mentorados_slug ON mentorados(slug);

-- Step 3: Add unique constraint
ALTER TABLE mentorados ADD CONSTRAINT unique_slug UNIQUE(slug);

-- Step 4: Later (after script populates): Set NOT NULL
-- ALTER TABLE mentorados ALTER COLUMN slug SET NOT NULL;
