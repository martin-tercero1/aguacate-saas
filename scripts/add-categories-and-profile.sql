-- =====================================================
-- Migration: Add categories and profile tables
-- =====================================================

-- 1. Categories table
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  color       TEXT DEFAULT '#6b7280',
  "isDefault" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own categories"
  ON categories FOR ALL
  USING (auth.uid() = "userId");

-- 2. Profile table (one per user, extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "fullName"      TEXT,
  phone           TEXT,
  "farmName"      TEXT,
  location        TEXT,
  "hectares"      NUMERIC(10,2),
  "avatarUrl"     TEXT,
  "createdAt"     TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id);

-- 3. Seed function: creates default categories for a new user
CREATE OR REPLACE FUNCTION seed_default_categories(user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO categories ("userId", name, type, color, "isDefault") VALUES
    -- Default expense categories
    (user_id, 'Insumos',          'expense', '#ef4444', true),
    (user_id, 'Mano de obra',     'expense', '#f97316', true),
    (user_id, 'Mantenimiento',    'expense', '#eab308', true),
    (user_id, 'Transporte',       'expense', '#3b82f6', true),
    (user_id, 'Agroquimicos',     'expense', '#8b5cf6', true),
    (user_id, 'Herramientas',     'expense', '#06b6d4', true),
    (user_id, 'Agua / Riego',     'expense', '#0ea5e9', true),
    (user_id, 'Otros gastos',     'expense', '#6b7280', true),
    -- Default income categories
    (user_id, 'Venta de cosecha', 'income',  '#22c55e', true),
    (user_id, 'Subsidios',        'income',  '#84cc16', true),
    (user_id, 'Otros ingresos',   'income',  '#10b981', true)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
