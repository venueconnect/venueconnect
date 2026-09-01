-- ============================================================
-- VenueConnect Database Fix Migration
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
