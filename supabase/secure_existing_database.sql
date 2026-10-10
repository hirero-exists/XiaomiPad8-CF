-- Access control migration for the existing campaign database.
-- Run the complete transaction in Supabase SQL Editor as the project administrator.
-- Keeps every donation, saved conversion rate, and campaign setting unchanged.
-- Before running, check the admin email below matches your existing Auth user.
-- Legacy permission scripts must not be reapplied after this migration.
BEGIN;

CREATE TABLE IF NOT EXISTS public.campaign_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.campaign_admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.campaign_admins FROM PUBLIC, anon, authenticated;

DO $$
DECLARE
    v_admin_email TEXT := 'forpayment169@gmail.com'; -- Change if your admin email differs.
    v_admin_id UUID;
BEGIN
    SELECT id INTO v_admin_id FROM auth.users WHERE lower(email) = lower(v_admin_email);
    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Admin Auth user not found. Set v_admin_email to your existing admin email and rerun. No changes were applied.';
    END IF;
    INSERT INTO public.campaign_admins (user_id) VALUES (v_admin_id) ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_campaign_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    SELECT EXISTS (SELECT 1 FROM public.campaign_admins WHERE user_id = auth.uid());
$$;
REVOKE ALL ON FUNCTION public.is_campaign_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_campaign_admin() TO authenticated;

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign ENABLE ROW LEVEL SECURITY;

-- Replace policies on these two app tables; permissive policies otherwise combine.
DO $$
DECLARE v_policy RECORD;
BEGIN
    FOR v_policy IN SELECT tablename, policyname FROM pg_policies
        WHERE schemaname = 'public' AND tablename IN ('donations', 'campaign')
    LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', v_policy.policyname, v_policy.tablename);
    END LOOP;
END;
$$;

REVOKE ALL ON public.donations FROM PUBLIC, anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.donations TO authenticated;
GRANT INSERT (payment_method, native_amount, native_currency, payment_reference,
    display_name, show_name, message, status) ON public.donations TO anon, authenticated;

CREATE POLICY "Submit pending donations" ON public.donations
FOR INSERT TO anon, authenticated
WITH CHECK (
    status = 'pending' AND native_amount > 0
    AND COALESCE(usd_amount, 0) = 0 AND COALESCE(inr_amount, 0) = 0
    AND fx_rate IS NULL AND fx_timestamp IS NULL AND approved_at IS NULL
);
CREATE POLICY "Campaign admins manage donations" ON public.donations
FOR ALL TO authenticated
USING ((SELECT public.is_campaign_admin()))
WITH CHECK ((SELECT public.is_campaign_admin()));

REVOKE ALL ON public.campaign FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.campaign TO anon, authenticated;
GRANT UPDATE ON public.campaign TO authenticated;
CREATE POLICY "Public campaign settings" ON public.campaign
FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Campaign admins update settings" ON public.campaign
FOR UPDATE TO authenticated
USING ((SELECT public.is_campaign_admin()))
WITH CHECK ((SELECT public.is_campaign_admin()));

CREATE OR REPLACE FUNCTION public.submit_donation(
    p_payment_method TEXT, p_native_amount NUMERIC, p_native_currency TEXT,
    p_payment_reference TEXT, p_display_name TEXT DEFAULT NULL,
    p_show_name BOOLEAN DEFAULT true, p_message TEXT DEFAULT NULL
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE v_id UUID;
BEGIN
    IF p_payment_method IS NULL OR p_payment_method NOT IN ('upi', 'international')
       OR p_native_amount IS NULL OR NOT (p_native_amount > 0 AND p_native_amount < 1000000000)
       OR p_native_currency IS NULL OR upper(p_native_currency) NOT IN ('INR', 'USD', 'EUR', 'GBP', 'OTHER')
       OR p_payment_reference IS NULL OR length(trim(p_payment_reference)) NOT BETWEEN 1 AND 200
       OR length(COALESCE(p_display_name, '')) > 100 OR length(COALESCE(p_message, '')) > 1000
    THEN RAISE EXCEPTION 'Invalid donation details' USING ERRCODE = '22023'; END IF;

    INSERT INTO public.donations (payment_method, native_amount, native_currency,
        payment_reference, display_name, show_name, message, status)
    VALUES (p_payment_method, p_native_amount, upper(p_native_currency),
        trim(p_payment_reference), NULLIF(trim(p_display_name), ''), COALESCE(p_show_name, false),
        NULLIF(trim(p_message), ''), 'pending') RETURNING id INTO v_id;
    RETURN json_build_object('success', true, 'id', v_id);
END;
$$;
REVOKE ALL ON FUNCTION public.submit_donation(TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_donation(TEXT, NUMERIC, TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.approve_donation(
    p_id UUID, p_usd_amount NUMERIC, p_inr_amount NUMERIC, p_fx_rate NUMERIC DEFAULT NULL
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    IF NOT public.is_campaign_admin() THEN
        RAISE EXCEPTION 'Campaign admin access required' USING ERRCODE = '42501';
    END IF;
    IF p_usd_amount IS NULL OR NOT (p_usd_amount > 0 AND p_usd_amount < 1000000000)
       OR p_inr_amount IS NULL OR NOT (p_inr_amount > 0 AND p_inr_amount < 100000000000)
       OR p_fx_rate IS NULL OR NOT (p_fx_rate > 0 AND p_fx_rate < 1000000)
    THEN RAISE EXCEPTION 'Valid amounts and exchange rate required' USING ERRCODE = '22023'; END IF;

    UPDATE public.donations SET status = 'approved', usd_amount = p_usd_amount,
        inr_amount = p_inr_amount, fx_rate = p_fx_rate, fx_timestamp = now(), approved_at = now()
    WHERE id = p_id AND lower(status) = 'pending';
    IF NOT FOUND THEN RETURN json_build_object('success', false, 'error', 'Donation is no longer pending or does not exist'); END IF;
    RETURN json_build_object('success', true);
END;
$$;
REVOKE ALL ON FUNCTION public.approve_donation(UUID, NUMERIC, NUMERIC, NUMERIC) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_donation(UUID, NUMERIC, NUMERIC, NUMERIC) TO authenticated;

-- Deliberate owner-executed view: public visitors have no access to base rows.
-- Only approved records and the explicitly listed public fields are exposed.
CREATE OR REPLACE VIEW public.public_donations WITH (security_barrier = true) AS
SELECT id, payment_method, native_amount, native_currency, inr_amount, usd_amount,
    CASE WHEN show_name AND NULLIF(trim(display_name), '') IS NOT NULL
        THEN display_name ELSE 'Anonymous' END AS display_name,
    message, created_at, COALESCE(approved_at, created_at) AS approved_at,
    fx_rate
FROM public.donations WHERE lower(status) = 'approved';
ALTER VIEW public.public_donations SET (security_invoker = false);
REVOKE ALL ON public.public_donations FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_donations TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_funding_summary()
RETURNS JSON LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
    SELECT json_build_object('total_usd_raised', COALESCE(SUM(usd_amount), 0),
        'total_inr_raised', COALESCE(SUM(inr_amount), 0), 'verified_count', COUNT(id))
    FROM public.donations WHERE lower(status) = 'approved';
$$;
REVOKE ALL ON FUNCTION public.get_funding_summary() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_funding_summary() TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
