-- ============================================================
-- VenueConnect Complete Database & Storage Fix Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- FIX 1: Create missing 'user_requirements' table
-- (Error: "Could not find the table public.user_requirements")
-- ============================================================
CREATE TABLE IF NOT EXISTS user_requirements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    occasion text,
    city text,
    budget_per_person text,
    expected_guests integer DEFAULT 0,
    event_date text,
    customer_name text,
    customer_email text,
    customer_phone text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_requirements ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form on homepage)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_requirements' AND policyname = 'Allow anonymous inserts on user_requirements'
    ) THEN
        CREATE POLICY "Allow anonymous inserts on user_requirements" ON user_requirements
            FOR INSERT TO anon WITH CHECK (true);
    END IF;
END $$;

-- Allow authenticated reads (for admin dashboard)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_requirements' AND policyname = 'Allow authenticated reads on user_requirements'
    ) THEN
        CREATE POLICY "Allow authenticated reads on user_requirements" ON user_requirements
            FOR SELECT TO authenticated USING (true);
    END IF;
END $$;


-- ============================================================
-- FIX 2: Add missing 'area' column to 'venue_applications'
-- (Error: "Could not find the 'area' column of 'venue_applications'")
-- ============================================================
ALTER TABLE venue_applications ADD COLUMN IF NOT EXISTS area text;


-- ============================================================
-- FIX 3: Create 'venue-gallery' and 'venue_applications_images' Storage Buckets
-- (Error: "Failed to upload resort.jpg: Bucket not found")
-- ============================================================

-- 1. Create buckets if they don't exist and make them public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('venue-gallery', 'venue-gallery', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']),
  ('venue_applications_images', 'venue_applications_images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
ON CONFLICT (id) DO UPDATE 
SET public = true, 
    file_size_limit = 10485760, 
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

-- 2. Allow public read access to all images
DROP POLICY IF EXISTS "Public read access for venue-gallery" ON storage.objects;
CREATE POLICY "Public read access for venue-gallery"
ON storage.objects FOR SELECT
USING (bucket_id IN ('venue-gallery', 'venue_applications_images'));

-- 3. Allow anonymous & authenticated users to upload images
DROP POLICY IF EXISTS "Allow uploads to venue-gallery" ON storage.objects;
CREATE POLICY "Allow uploads to venue-gallery"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('venue-gallery', 'venue_applications_images'));

-- 4. Allow users to update their uploads
DROP POLICY IF EXISTS "Allow updates to venue-gallery" ON storage.objects;
CREATE POLICY "Allow updates to venue-gallery"
ON storage.objects FOR UPDATE
USING (bucket_id IN ('venue-gallery', 'venue_applications_images'));

-- 5. Allow users to delete their uploads
DROP POLICY IF EXISTS "Allow deletions from venue-gallery" ON storage.objects;
CREATE POLICY "Allow deletions from venue-gallery"
ON storage.objects FOR DELETE
USING (bucket_id IN ('venue-gallery', 'venue_applications_images'));
