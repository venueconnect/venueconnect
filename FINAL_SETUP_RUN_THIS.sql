-- ============================================================
-- VENUECONNECT - FINAL COMPLETE DATABASE SETUP (CLEAN SLATE)
-- ============================================================
-- WARNING: This script will DELETE existing data in these tables
-- to ensure the schema is 100% correct.
-- ============================================================
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard > SQL Editor.
-- 2. Paste this ENTIRE script.
-- 3. Click "Run".
-- ============================================================

-- 0. CLEANUP (Drop existing to avoid schema mismatches)
DROP TABLE IF EXISTS public.user_favorites CASCADE;
DROP TABLE IF EXISTS public.venue_leads CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.venue_applications CASCADE;
DROP TABLE IF EXISTS public.vendors CASCADE;
DROP TABLE IF EXISTS public.venues CASCADE;
DROP TABLE IF EXISTS public.seo_pages CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. EXTENSIONS & TYPES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'owner', 'admin');
    END IF;
END $$;

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    avatar_url text,
    role user_role default 'user',
    phone_number text,
    planned_event_date date,
    created_at timestamp with time zone default now()
);

-- 3. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.locations (
    id uuid default gen_random_uuid() primary key,
    city text not null,
    city_slug text not null,
    area text not null,
    area_slug text not null,
    state text default 'Gujarat',
    created_at timestamp with time zone default now(),
    CONSTRAINT locations_city_area_unique UNIQUE (city_slug, area_slug)
);

-- 4. SEO PAGES TABLE
CREATE TABLE IF NOT EXISTS public.seo_pages (
    id uuid default gen_random_uuid() primary key,
    slug text not null unique,
    page_type text not null,
    city_id uuid references public.locations(id) on delete set null,
    custom_content jsonb default '{}'::jsonb,
    created_at timestamp with time zone default now()
);

-- 5. VENUES TABLE
CREATE TABLE IF NOT EXISTS public.venues (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    name text not null,
    slug text,
    city text,
    location text,
    address text,
    type text,
    rating numeric default 0,
    reviews integer default 0,
    image text,
    images text[],
    owner_id uuid references public.profiles(id) on delete set null,
    min_capacity integer default 0,
    max_capacity integer default 0,
    rooms_count integer default 0,
    veg_price_per_plate integer default 0,
    nonveg_price_per_plate integer default 0,
    has_ac boolean default false,
    has_wifi boolean default false,
    alcohol_served boolean default false,
    cuisines text[],
    indoor_spaces integer default 0,
    outdoor_spaces integer default 0,
    payment_methods text[],
    catering_policy text,
    advance_payment_percentage integer,
    operating_hours text,
    amenities text[],
    starting_price integer,
    is_approved boolean default true,
    is_featured boolean default false,
    is_active boolean default true,
    is_verified boolean default true,
    description text,
    room_starting_price integer,
    dj_available boolean default false,
    dj_price integer,
    dj_tax integer,
    parking_capacity integer,
    food_served text[],
    usps text[],
    outside_liquor_permitted boolean default false,
    license_required_price integer,
    corkage_charges integer,
    booking_policy text,
    cancellation_policy text,
    nearest_landmark text,
    nearest_airport text,
    nearest_bus_stand text,
    policy_terms text,
    disclaimer text
);

-- 6. VENDORS TABLE
CREATE TABLE IF NOT EXISTS public.vendors (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    name text not null,
    slug text,
    city text,
    location text,
    address text,
    category text,
    rating numeric default 0,
    reviews integer default 0,
    image text,
    images text[],
    logo_url text,
    owner_id uuid references public.profiles(id) on delete set null,
    is_approved boolean default true,
    is_featured boolean default false,
    is_active boolean default true,
    is_verified boolean default true,
    starting_price integer default 0,
    description text
);

-- 7. VENUE APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.venue_applications (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    business_name text not null,
    contact_person text not null,
    business_email text not null,
    business_phone text not null,
    address text not null,
    city text not null,
    venue_type text not null,
    capacity integer,
    price_per_plate integer,
    amenities text[],
    description text,
    image_url text,
    status text default 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    user_id uuid references public.profiles(id) on delete set null,
    min_capacity integer,
    max_capacity integer,
    rooms_count integer,
    veg_price_per_plate integer,
    nonveg_price_per_plate integer,
    has_ac boolean default false,
    has_wifi boolean default false,
    cuisines text[],
    indoor_spaces integer default 0,
    outdoor_spaces integer default 0,
    payment_methods text[],
    catering_policy text,
    advance_payment_percentage integer,
    operating_hours text,
    alcohol_served boolean default false,
    images text[],
    vendor_category text
);

-- 8. LEADS TABLE
CREATE TABLE IF NOT EXISTS public.leads (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    listing_id uuid not null,
    listing_type text not null CHECK (listing_type IN ('venue', 'vendor')),
    owner_id uuid references public.profiles(id) on delete cascade,
    customer_name text not null,
    customer_email text not null,
    customer_phone text,
    event_date date,
    message text,
    status text default 'new' CHECK (status IN ('new', 'contacted', 'closed'))
);

-- 9. VENUE LEADS TABLE
CREATE TABLE IF NOT EXISTS public.venue_leads (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    venue_name text not null,
    event_date text not null,
    guest_count integer not null,
    name text not null,
    phone text not null,
    email text not null,
    requirements text,
    status text default 'new'
);

-- 10. USER FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id uuid not null default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade,
    listing_id uuid not null,
    listing_type text not null,
    created_at timestamp with time zone default now(),
    UNIQUE(user_id, listing_id)
);

-- 11. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Select Policies (Public Access)
CREATE POLICY "Public Read Access Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Read Access Locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Public Read Access SEO Pages" ON public.seo_pages FOR SELECT USING (true);
CREATE POLICY "Public Read Access Venues" ON public.venues FOR SELECT USING (true);
CREATE POLICY "Public Read Access Vendors" ON public.vendors FOR SELECT USING (true);

-- Insert/Update Policies
CREATE POLICY "Anyone can insert venue applications" ON public.venue_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public inserts to venue_leads" ON public.venue_leads FOR INSERT WITH CHECK (true);

-- 10. AUTH TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. DEMO DATA — VENUES
INSERT INTO public.venues (name, city, location, address, type, rating, reviews, image, images, starting_price, min_capacity, max_capacity, has_ac, has_wifi, description, amenities)
VALUES 
(
    'The Grand Rajwada Palace',
    'Ahmedabad',
    'Ahmedabad, Gujarat',
    'SG Highway, Ahmedabad',
    'Banquet Hall',
    4.8, 347,
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80','https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80'],
    75000, 300, 2000, true, true,
    'Gujarat''s most iconic luxury banquet hall offering world-class hospitality for weddings, receptions, and corporate events. Breathtaking décor, professional catering, and dedicated event management ensure a flawless celebration.',
    ARRAY['AC Banquet', 'Valet Parking', 'Catering', 'Stage & Lighting', 'Bridal Suite', 'Power Backup']
),
(
    'Royal Greens Farmhouse',
    'Surat',
    'Surat, Gujarat',
    'Adajan, Surat',
    'Farmhouse',
    4.7, 218,
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80','https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80'],
    55000, 200, 800, false, true,
    'Sprawling lush farmhouse set in serene greenery on the outskirts of Surat. Perfect for outdoor weddings, sangeets, and family gatherings. Lap pool, fire pit, and ample open space create magical evenings.',
    ARRAY['Outdoor Lawn', 'Swimming Pool', 'Garden Area', 'DJ Sound', 'Bonfire', 'Catering Kitchen']
),
(
    'Lakshmi Vilas Convention Centre',
    'Vadodara',
    'Vadodara, Gujarat',
    'Alkapuri, Vadodara',
    'Convention Center',
    4.9, 312,
    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80','https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80'],
    90000, 500, 3000, true, true,
    'Vadodara''s premier convention centre with state-of-the-art infrastructure, modular hall designs, and impeccable service. Hosts grand weddings, corporate summits, and cultural events regularly.',
    ARRAY['AC Halls', 'Conference Rooms', 'Projector & AV', 'Parking 500+', 'Bridal Changing Room', 'Full Catering']
),
(
    'Sapphire Skyline Convention',
    'Rajkot',
    'Rajkot, Gujarat',
    'Kalawad Road, Rajkot',
    'Convention Center',
    4.5, 156,
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80'],
    45000, 150, 1000, true, true,
    'A modern, elegantly designed venue in the heart of Rajkot. Flexible seating arrangements cater to intimate gatherings as well as large celebrations with equal perfection.',
    ARRAY['AC Banquet', 'WiFi', 'Projector', 'Parking', 'Catering']
),
(
    'Heritage Palace & Lawn',
    'Gandhinagar',
    'Gandhinagar, Gujarat',
    'Sector 21, Gandhinagar',
    'Heritage Venue',
    4.6, 98,
    'https://images.unsplash.com/photo-1573062122217-3b2e01a4dad0?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1573062122217-3b2e01a4dad0?w=800&q=80','https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80'],
    65000, 250, 1500, true, true,
    'A restored heritage property exuding old-world charm with modern upgrades. Manicured lawns and palatial interiors make every event feel truly regal.',
    ARRAY['Heritage Décor', 'Outdoor Lawn', 'Royal Suite', 'Catering', 'Valet Parking']
),
(
    'Emerald Gardens Resort',
    'Bhavnagar',
    'Bhavnagar, Gujarat',
    'Near Station Road, Bhavnagar',
    'Resort',
    4.4, 74,
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'],
    40000, 100, 600, true, true,
    'Surrounded by tropical greenery, Emerald Gardens blends natural beauty with sophisticated amenities. Ideal for destination weddings and resort-style celebrations.',
    ARRAY['Pool Side Venue', 'Cottages', 'Spa', 'In-house Catering', 'Parking']
),
(
    'Silver Jubilee Banquet',
    'Anand',
    'Anand, Gujarat',
    'Vallabh Vidyanagar Rd, Anand',
    'Banquet Hall',
    4.3, 62,
    'https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?w=800&q=80'],
    30000, 100, 500, true, false,
    'Trusted by generations of families in Anand district for joyful celebrations. Warm hospitality, affordable packages, and excellent in-house catering are the hallmarks of this venue.',
    ARRAY['AC Hall', 'Stage', 'In-house Catering', 'Parking', 'Generator Backup']
),
(
    'Sunrise Terrace & Lawn',
    'Surat',
    'Surat, Gujarat',
    'Vesu, Surat',
    'Banquet Hall',
    4.6, 145,
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80'],
    60000, 200, 1200, true, true,
    'A stunning rooftop terrace combined with a sprawling ground-floor lawn, offering stunning city views and flexible event configurations for all occasions.',
    ARRAY['Rooftop Terrace', 'Open Lawn', 'AC Banquet', 'Catering', 'Valet Parking', 'Décor']
),
(
    'Pearl Boutique Venue',
    'Ahmedabad',
    'Ahmedabad, Gujarat',
    'Prahlad Nagar, Ahmedabad',
    'Boutique Venue',
    4.7, 189,
    'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80'],
    35000, 50, 300, true, true,
    'Intimate, chic, and utterly charming — Pearl Boutique Venue is the top choice for intimate weddings, ring ceremonies, baby showers, and upscale private parties.',
    ARRAY['Intimate Setting', 'Designer Décor', 'Catering', 'Parking', 'Bridal Room']
),
(
    'Imperial Convention Hall',
    'Rajkot',
    'Rajkot, Gujarat',
    'Tagore Road, Rajkot',
    'Convention Center',
    4.8, 224,
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80','https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80'],
    80000, 400, 2500, true, true,
    'Rajkot''s largest and most prestigious convention hall, spanning 35,000 sq ft. Known for flawlessly executing grand weddings, political summits, and cultural extravaganzas.',
    ARRAY['Grand Ballroom', 'Pre-function Area', 'Full Catering', 'AV System', 'Parking 600+', 'Security']
);

-- 11b. DEMO DATA — VENDORS
INSERT INTO public.vendors (name, city, location, address, category, rating, reviews, image, starting_price, description)
VALUES 
(
    'Lens & Light Photography',
    'Ahmedabad',
    'Ahmedabad, Gujarat',
    'Navrangpura, Ahmedabad',
    'Photographers',
    4.9, 412,
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    25000,
    'Award-winning wedding photography studio led by Rishi Shah. Specialising in cinematic wedding films and editorial-style wedding photography across Gujarat. Candid moments, frozen forever.'
),
(
    'Meera Makeup Studio',
    'Surat',
    'Surat, Gujarat',
    'Adajan, Surat',
    'Makeup Artists',
    4.8, 287,
    'https://images.unsplash.com/photo-1487412947147-5cebf100d898?w=800&q=80',
    8000,
    'Surat''s top bridal makeup artist. Meera Patel and her team specialise in HD makeup, airbrush techniques, and traditional Gujarati bridal looks. Trial sessions available.'
),
(
    'Dream Décor & Events',
    'Vadodara',
    'Vadodara, Gujarat',
    'Alkapuri, Vadodara',
    'Decorators',
    4.7, 195,
    'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80',
    35000,
    'Full-service event decoration company creating breathtaking setups for weddings, engagements, and corporate events. Floral themes, fairy lights, and thematic installations are our signature.'
),
(
    'Royal Catering Services',
    'Ahmedabad',
    'Ahmedabad, Gujarat',
    'Maninagar, Ahmedabad',
    'Caterers',
    4.9, 523,
    'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80',
    500,
    'Legendary Gujarati catering house known for authentic flavours, live counters, and immaculate presentation. Specialities include traditional thali, chaat stalls, and continental buffets. Veg only.'
),
(
    'Rhythm DJs & Sound',
    'Rajkot',
    'Rajkot, Gujarat',
    'Gondal Road, Rajkot',
    'DJs',
    4.6, 142,
    'https://images.unsplash.com/photo-1534180477871-5d6cc81f3920?w=800&q=80',
    15000,
    'Professional DJ and sound system providers serving weddings, sangeet nights, and corporate parties across Gujarat. Premium LED walls, truss lighting, and experienced DJs available.'
),
(
    'Blossom Mehndi Artists',
    'Gandhinagar',
    'Gandhinagar, Gujarat',
    'Sector 11, Gandhinagar',
    'Mehndi Artists',
    4.8, 334,
    'https://images.unsplash.com/photo-1603217192634-61068e4d4bf9?w=800&q=80',
    5000,
    'Traditional and fusion mehndi artists specialising in intricate bridal mehndi, Arabic patterns, and modern geometric designs. Home service available across all Gujarat cities.'
),
(
    'Golden Moments Videography',
    'Ahmedabad',
    'Ahmedabad, Gujarat',
    'Bodakdev, Ahmedabad',
    'Videographers',
    4.7, 178,
    'https://images.unsplash.com/photo-1536240478700-b869ad10e2af?w=800&q=80',
    30000,
    'Cinematic wedding films and same-day highlight reels crafted by a team of creative videographers. 4K aerial drone footage, teaser reels, and full feature films are our speciality.'
),
(
    'Shubh Bandhan Pandit Services',
    'Vadodara',
    'Vadodara, Gujarat',
    'Sayajigunj, Vadodara',
    'Pandit',
    5.0, 89,
    'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&q=80',
    3500,
    'Experienced and respected pandits performing all Hindu wedding rituals, pujas, and havan ceremonies according to Vedic traditions. Available for all ceremonies across Gujarat.'
);
