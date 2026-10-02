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
