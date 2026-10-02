-- ==============================================================================
-- Xiaomi Pad 8 Crowdfunding Database Schema & Security Policies
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Create campaign table
CREATE TABLE IF NOT EXISTS public.campaign (
    id TEXT PRIMARY KEY DEFAULT 'xiaomi_pad_8',
    usd_goal NUMERIC NOT NULL DEFAULT 370.00,
    device_price_inr NUMERIC NOT NULL DEFAULT 52000.00,
    fundraising_enabled BOOLEAN NOT NULL DEFAULT true,
    campaign_status TEXT NOT NULL DEFAULT 'fundraising' CHECK (campaign_status IN ('interest', 'fundraising', 'goal_reached', 'refunds', 'completed')),
    payment_url TEXT DEFAULT 'https://www.thankyouverymuch.co/xiaomipad8',
    upi_id TEXT DEFAULT 'developer@upi',
    purchase_status TEXT DEFAULT 'pending' CHECK (purchase_status IN ('pending', 'ordered', 'received')),
    purchase_proof_url TEXT DEFAULT '',
    purchase_notes TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial campaign record if empty
INSERT INTO public.campaign (id, usd_goal, device_price_inr, fundraising_enabled, campaign_status, payment_url, upi_id, purchase_status)
VALUES ('xiaomi_pad_8', 370.00, 52000.00, true, 'fundraising', 'https://www.thankyouverymuch.co/xiaomipad8', 'developer@upi', 'pending')
ON CONFLICT (id) DO NOTHING;

-- 2. Create donations table
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('upi', 'international')),
    native_amount NUMERIC NOT NULL CHECK (native_amount > 0),
    native_currency TEXT NOT NULL DEFAULT 'INR',
    inr_amount NUMERIC DEFAULT 0,
    usd_amount NUMERIC DEFAULT 0,
    fx_rate NUMERIC DEFAULT NULL,
    fx_timestamp TIMESTAMPTZ DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
    display_name TEXT DEFAULT NULL,
    show_name BOOLEAN NOT NULL DEFAULT true,
    message TEXT DEFAULT NULL,
    payment_reference TEXT NOT NULL, -- SENSITIVE: UTR or Gateway TxID (strictly private)
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at TIMESTAMPTZ DEFAULT NULL
);

-- Index for speedy queries
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at DESC);

-- 3. Secure Public View
-- This view guarantees that payment_reference is NEVER exposed to public visitors,
-- and only approved donations are visible.
CREATE OR REPLACE VIEW public.public_donations AS
SELECT 
    id,
    payment_method,
    native_amount,
    native_currency,
    inr_amount,
    usd_amount,
    CASE 
        WHEN show_name = true AND display_name IS NOT NULL AND trim(display_name) != '' 
        THEN display_name 
        ELSE 'Anonymous' 
    END AS display_name,
    message,
    created_at,
    approved_at
FROM public.donations
WHERE status = 'approved'
ORDER BY approved_at DESC NULLS LAST;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign ENABLE ROW LEVEL SECURITY;

-- 5. Donations RLS Policies

-- Public users can ONLY insert donations with 'pending' status
CREATE POLICY "Public insert pending donations"
ON public.donations
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');

-- Public users CANNOT directly select from donations table
-- (They will read via public_donations view or authenticated admin session)
-- Authenticated admins have full SELECT, UPDATE, DELETE permissions on donations:
CREATE POLICY "Admins have full access to donations"
ON public.donations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Campaign RLS Policies

-- Public users can view the campaign settings
CREATE POLICY "Public view campaign"
ON public.campaign
FOR SELECT
TO anon, authenticated
USING (true);

-- Only authenticated admins can update campaign settings
CREATE POLICY "Admins update campaign"
ON public.campaign
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. Secure summary RPC function for totals
CREATE OR REPLACE FUNCTION public.get_funding_summary()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_usd_raised', COALESCE(SUM(usd_amount), 0),
        'total_inr_raised', COALESCE(SUM(inr_amount), 0),
        'verified_count', COUNT(id)
    )
    INTO result
    FROM public.donations
    WHERE status = 'approved';

    RETURN result;
END;
$$;

-- Grant execute permissions to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_funding_summary() TO anon, authenticated;
GRANT SELECT ON public.public_donations TO anon, authenticated;

-- ==============================================================================
-- 8. Admin User Setup (Email & Password)
-- ==============================================================================
-- You can create your admin user directly in the Supabase Dashboard:
-- 1. Go to "Authentication" -> "Users" on the left menu.
-- 2. Click "Add user" -> "Create user".
-- 3. Email: forpayment169@gmail.com
--    Password: KAZUOAexists765!
-- 4. Check "Auto Confirm User?" -> ON.
-- 5. Click "Create user".
--
-- You can change your password anytime directly from the /#/admin dashboard!
-- ==============================================================================
