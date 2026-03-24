-- =====================================================
-- Fix: RLS Policies for Categories and Profiles
-- =====================================================

-- Drop existing policies and recreate with proper permissions
DROP POLICY IF EXISTS "Users can manage their own categories" ON categories;
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;

-- Categories: Allow users to SELECT, INSERT, UPDATE, DELETE their own categories
CREATE POLICY "Users can read their own categories"
  ON categories FOR SELECT
  USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can delete their own categories"
  ON categories FOR DELETE
  USING (auth.uid() = "userId");

-- Profiles: Allow users to SELECT, INSERT, UPDATE, DELETE their own profile
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

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- =====================================================
-- Trigger: Auto-create profile + seed categories on signup
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a profile row for the new user
  INSERT INTO public.profiles (id) VALUES (new.id);
  
  -- Seed default categories for the new user
  PERFORM seed_default_categories(new.id);
  
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
