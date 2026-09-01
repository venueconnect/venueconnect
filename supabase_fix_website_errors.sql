-- ============================================================
-- VenueConnect Complete Database Schema & Storage Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- 1. Create missing 'user_requirements' table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_requirements (
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
ALTER TABLE public.user_requirements ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form on homepage)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_requirements' AND policyname = 'Allow anonymous inserts on user_requirements'
    ) THEN
        CREATE POLICY "Allow anonymous inserts on user_requirements" ON public.user_requirements
            FOR INSERT TO anon WITH CHECK (true);
    END IF;
END $$;

-- Allow authenticated reads (for admin dashboard)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_requirements' AND policyname = 'Allow authenticated reads on user_requirements'
    ) THEN
        CREATE POLICY "Allow authenticated reads on user_requirements" ON public.user_requirements
            FOR SELECT TO authenticated USING (true);
    END IF;
END $$;


-- ============================================================
-- 2. Add ALL missing columns to 'venue_applications'
-- (Fixes: missing area, booking_policy, cancellation_policy, space_info, etc.)
-- ============================================================
ALTER TABLE public.venue_applications
ADD COLUMN IF NOT EXISTS area text,
ADD COLUMN IF NOT EXISTS food_type text DEFAULT 'both',
ADD COLUMN IF NOT EXISTS min_capacity integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_capacity integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS rooms_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS veg_price_per_plate integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS nonveg_price_per_plate integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS space_info jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS occasions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS decoration_info jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS liquor_info jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS dj_info jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS catering_policy text,
ADD COLUMN IF NOT EXISTS booking_policy text,
ADD COLUMN IF NOT EXISTS terms_conditions text,
ADD COLUMN IF NOT EXISTS cancellation_policy text,
ADD COLUMN IF NOT EXISTS parking_details jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cuisines text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS selected_plan text DEFAULT 'Starter',
ADD COLUMN IF NOT EXISTS vendor_category text,
ADD COLUMN IF NOT EXISTS has_ac boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_wifi boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS indoor_spaces integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS outdoor_spaces integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_methods text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS advance_payment_percentage integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS operating_hours text,
ADD COLUMN IF NOT EXISTS alcohol_served boolean DEFAULT false;

-- Ensure RLS allows inserts to venue_applications
ALTER TABLE public.venue_applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'venue_applications' AND policyname = 'Anyone can insert venue applications'
    ) THEN
        CREATE POLICY "Anyone can insert venue applications" ON public.venue_applications
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;


-- ============================================================
-- 3. Add matching columns to 'venues' and 'vendors' tables
-- (Ensures Admin approval migration runs without column errors)
-- ============================================================
ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS area text,
ADD COLUMN IF NOT EXISTS food_type text DEFAULT 'both',
ADD COLUMN IF NOT EXISTS min_capacity integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_capacity integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS rooms_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS veg_price_per_plate integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS nonveg_price_per_plate integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS space_info jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS occasions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS decoration_info jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS liquor_info jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS dj_info jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS catering_policy text,
ADD COLUMN IF NOT EXISTS booking_policy text,
ADD COLUMN IF NOT EXISTS terms_conditions text,
ADD COLUMN IF NOT EXISTS cancellation_policy text,
ADD COLUMN IF NOT EXISTS parking_details jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cuisines text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS selected_plan text DEFAULT 'Starter',
ADD COLUMN IF NOT EXISTS leads_quota integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS leads_used integer DEFAULT 0;

ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS selected_plan text DEFAULT 'Starter',
ADD COLUMN IF NOT EXISTS leads_quota integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS leads_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';


-- ============================================================
-- 4. Create & Configure Storage Buckets for Images
-- (Fixes: "Failed to upload resort.jpg: Bucket not found")
-- ============================================================

-- Create buckets and mark public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('venue-gallery', 'venue-gallery', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']),
  ('venue_applications_images', 'venue_applications_images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
ON CONFLICT (id) DO UPDATE 
SET public = true, 
    file_size_limit = 10485760, 
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

-- Storage Policies
DROP POLICY IF EXISTS "Public read access for venue-gallery" ON storage.objects;
CREATE POLICY "Public read access for venue-gallery"
ON storage.objects FOR SELECT
USING (bucket_id IN ('venue-gallery', 'venue_applications_images'));

DROP POLICY IF EXISTS "Allow uploads to venue-gallery" ON storage.objects;
CREATE POLICY "Allow uploads to venue-gallery"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('venue-gallery', 'venue_applications_images'));

DROP POLICY IF EXISTS "Allow updates to venue-gallery" ON storage.objects;
CREATE POLICY "Allow updates to venue-gallery"
ON storage.objects FOR UPDATE
USING (bucket_id IN ('venue-gallery', 'venue_applications_images'));

DROP POLICY IF EXISTS "Allow deletions from venue-gallery" ON storage.objects;
CREATE POLICY "Allow deletions from venue-gallery"
ON storage.objects FOR DELETE
USING (bucket_id IN ('venue-gallery', 'venue_applications_images'));
