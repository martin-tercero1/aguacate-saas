-- =====================================================
-- Migration: Convert to Shared Categories System
-- =====================================================
-- This migration safely converts to a shared categories model.

-- Step 1: Make userId nullable to support shared categories
ALTER TABLE categories ALTER COLUMN "userId" DROP NOT NULL;

-- Step 2: Clear all existing categories (start fresh as requested)
DELETE FROM categories WHERE TRUE;

-- Step 3: Insert shared default categories (userId = NULL means global/shared)
INSERT INTO categories (id, "userId", name, type, color, "isDefault", "createdAt", "updatedAt") VALUES
  -- Shared expense categories (8 total)
  (gen_random_uuid(), NULL, 'Insumos',          'expense', '#ef4444', true, NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Mano de obra',     'expense', '#f97316', true, NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Mantenimiento',    'expense', '#eab308', true, NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Transporte',       'expense', '#3b82f6', true, NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Agroquimicos',     'expense', '#8b5cf6', true, NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Herramientas',     'expense', '#06b6d4', true, NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Agua / Riego',     'expense', '#0ea5e9', true, NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Otros gastos',     'expense', '#6b7280', true, NOW(), NOW()),
  -- Shared income categories (3 total)
  (gen_random_uuid(), NULL, 'Venta de cosecha', 'income',  '#22c55e', true, NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Subsidios',        'income',  '#84cc16', true, NOW(), NOW()),
  (gen_random_uuid(), NULL, 'Otros ingresos',   'income',  '#10b981', true, NOW(), NOW());

-- Step 4: Drop the seed_default_categories function (no longer needed)
DROP FUNCTION IF EXISTS seed_default_categories(UUID);

-- Step 5: Update RLS policies for shared + private model
-- First, drop existing policies
DROP POLICY IF EXISTS "Users can read their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

-- SELECT: Users can see shared categories (userId IS NULL) OR their own custom categories
CREATE POLICY "Users can read shared and own categories"
  ON categories FOR SELECT
  USING ("userId" IS NULL OR auth.uid() = "userId");

-- INSERT: Users can only create their own custom categories (not shared ones)
CREATE POLICY "Users can create own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = "userId" AND "userId" IS NOT NULL);

-- UPDATE: Users can only update their own custom categories (not shared defaults)
CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = "userId" AND "userId" IS NOT NULL)
  WITH CHECK (auth.uid() = "userId" AND "userId" IS NOT NULL);

-- DELETE: Users can only delete their own custom categories (not shared defaults)
CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = "userId" AND "userId" IS NOT NULL AND "isDefault" = false);

-- Step 6: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_userid_type ON categories ("userId", type);
CREATE INDEX IF NOT EXISTS idx_categories_shared ON categories (type) WHERE "userId" IS NULL;
