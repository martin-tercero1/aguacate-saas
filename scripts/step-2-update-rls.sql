-- Step 2: Drop and recreate RLS policies for categories (shared + user categories)

DROP POLICY IF EXISTS "Users can read their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;
DROP POLICY IF EXISTS "Users can read shared and own categories" ON categories;
DROP POLICY IF EXISTS "Users can create own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
DROP POLICY IF EXISTS "Users can manage their own categories" ON categories;

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
