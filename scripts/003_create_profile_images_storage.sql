-- Create the storage bucket for profile images if it doesn't exist
-- The bucket is private by default, requiring RLS policies for access
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  false,
  10485760, -- 10MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

-- RLS Policy: Users can only view their own profile images
-- Path pattern: profile/{user_id}/{filename}
CREATE POLICY "Users can view their own profile images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'images'
  AND (storage.foldername(name))[1] = 'profile'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- RLS Policy: Users can only upload to their own profile folder
CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images'
  AND (storage.foldername(name))[1] = 'profile'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- RLS Policy: Users can only update their own profile images
CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'images'
  AND (storage.foldername(name))[1] = 'profile'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- RLS Policy: Users can only delete their own profile images
CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images'
  AND (storage.foldername(name))[1] = 'profile'
  AND (storage.foldername(name))[2] = auth.uid()::text
);
