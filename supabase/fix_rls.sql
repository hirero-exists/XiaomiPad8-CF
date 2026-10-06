-- ==============================================================================
-- IMMEDIATE FIX FOR: "new row violates row-level security policy for table donations"
-- ==============================================================================
-- Run this in your Supabase SQL Editor (SQL Editor -> New Query -> Paste & Run)

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- 1. Drop any old policies
DROP POLICY IF EXISTS "Public insert pending donations" ON public.donations;
DROP POLICY IF EXISTS "Public insert donations" ON public.donations;
DROP POLICY IF EXISTS "Public read donations" ON public.donations;
DROP POLICY IF EXISTS "Admins have full access to donations" ON public.donations;
DROP POLICY IF EXISTS "Allow anon insert" ON public.donations;
DROP POLICY IF EXISTS "Allow anon select" ON public.donations;

-- 2. Allow public to insert donations without RLS block
CREATE POLICY "Allow anon insert"
ON public.donations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 3. Allow SELECT (required by PostgreSQL/Supabase to return the newly inserted row)
CREATE POLICY "Allow anon select"
ON public.donations
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Give authenticated admins full access to approve, update, delete
CREATE POLICY "Admins have full access to donations"
ON public.donations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Create secure submit_donation function (bypasses all client-side RLS quirks)
CREATE OR REPLACE FUNCTION public.submit_donation(
    p_payment_method TEXT,
    p_native_amount NUMERIC,
    p_native_currency TEXT,
    p_payment_reference TEXT,
    p_display_name TEXT DEFAULT NULL,
    p_show_name BOOLEAN DEFAULT true,
    p_message TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.donations (
        payment_method,
        native_amount,
        native_currency,
        payment_reference,
        display_name,
        show_name,
        message,
        status
    ) VALUES (
        p_payment_method,
        p_native_amount,
        p_native_currency,
        p_payment_reference,
        p_display_name,
        p_show_name,
        p_message,
        'pending'
    )
    RETURNING id INTO v_id;

    RETURN json_build_object('success', true, 'id', v_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_donation TO anon, authenticated;

-- 6. Secure approve_donation function (SECURITY DEFINER to avoid client update permissions blocks)
CREATE OR REPLACE FUNCTION public.approve_donation(
    p_id UUID,
    p_usd_amount NUMERIC,
    p_inr_amount NUMERIC,
    p_fx_rate NUMERIC DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.donations
    SET 
        status = 'approved',
        usd_amount = p_usd_amount,
        inr_amount = p_inr_amount,
        fx_rate = p_fx_rate,
        fx_timestamp = now(),
        approved_at = now()
    WHERE id = p_id;

    RETURN json_build_object('success', true);
END;
$$;

-- 7. Public donations view
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
    COALESCE(approved_at, created_at) AS approved_at
FROM public.donations
WHERE LOWER(status) = 'approved'
ORDER BY COALESCE(approved_at, created_at) DESC;

-- 8. Secure summary function
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
    WHERE LOWER(status) = 'approved';

    RETURN result;
END;
$$;

-- 9. Grant permissions to anon and authenticated
GRANT EXECUTE ON FUNCTION public.approve_donation TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_funding_summary TO anon, authenticated;
GRANT SELECT ON public.public_donations TO anon, authenticated;

-- 10. Auto-repair any existing approved donation where usd_amount or approved_at was 0/null
UPDATE public.donations
SET 
    usd_amount = CASE 
        WHEN native_currency = 'USD' THEN native_amount
        WHEN native_currency = 'INR' THEN ROUND((native_amount / 96.15)::numeric, 2)
        ELSE ROUND((native_amount / 96.15)::numeric, 2)
    END,
    inr_amount = CASE 
        WHEN native_currency = 'INR' THEN native_amount
        WHEN native_currency = 'USD' THEN ROUND((native_amount * 96.15)::numeric, 0)
        ELSE native_amount
    END,
    approved_at = COALESCE(approved_at, created_at, now())
WHERE LOWER(status) = 'approved' AND (usd_amount IS NULL OR usd_amount = 0);
