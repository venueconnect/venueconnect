-- ============================================================
-- VENUECONNECT - RESET PASSWORD FOR EXISTING ADMIN EMAIL
-- ============================================================
-- Run this in Supabase Dashboard > SQL Editor to change password
-- for an email when you don't have access to the inbox.
-- ============================================================

-- 1. UPDATE PASSWORD FOR YOUR EXISTING EMAIL
-- Replace 'admin@venueconnect.in' with your email
-- Replace 'YourNewPassword123!' with the password you want to set

UPDATE auth.users
SET encrypted_password = extensions.crypt('YourNewPassword123!', extensions.gen_salt('bf'))
WHERE email = 'admin@venueconnect.in';


-- 2. ENSURE ROLE IS SET TO ADMIN
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@venueconnect.in'
);


-- 3. VERIFY USER STATUS & ROLE
SELECT 
  u.id, 
  u.email, 
  p.role, 
  p.full_name,
  u.updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@venueconnect.in';
