-- =====================================================
-- Fix: RLS Policies for Categories and Profiles
-- =====================================================

-- Drop existing policies and recreate with proper permissions
DROP POLICY IF EXISTS "Users can manage their own categories" ON categories;
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;
DROP POLICY IF EXISTS "Users can read shared and own categories" ON categories;
DROP POLICY IF EXISTS "Users can create own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

-- Categories: SELECT shared (userId IS NULL) + own categories
CREATE POLICY "Users can read shared and own categories"
  ON categories FOR SELECT
  USING ("userId" IS NULL OR auth.uid() = "userId");

-- Categories: INSERT only custom categories (userId must be set)
CREATE POLICY "Users can create own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = "userId" AND "userId" IS NOT NULL);

-- Categories: UPDATE only own custom categories
CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = "userId" AND "userId" IS NOT NULL)
  WITH CHECK (auth.uid() = "userId" AND "userId" IS NOT NULL);

-- Categories: DELETE only own custom categories
CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = "userId" AND "userId" IS NOT NULL);

-- Profiles: Allow users to SELECT, INSERT, UPDATE their own profile
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- Trigger: Auto-create profile on signup (no category seeding)
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a profile row for the new user
  -- Shared categories are now used, so no seeding needed
  INSERT INTO public.profiles (id) VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

