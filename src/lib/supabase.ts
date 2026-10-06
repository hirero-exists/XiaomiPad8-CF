import { createClient } from '@supabase/supabase-js';
import { PublicDonation, Donation, CampaignData, FundingSummary } from './types';
import { CAMPAIGN_CONFIG } from '../config';
import { getLiveRates, calculateApprovalAmounts } from './exchangeRate';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local fallback mock storage for development/preview before Supabase is connected
const MOCK_STORAGE_KEY_DONATIONS = 'xiaomi_pad_8_mock_donations';
const MOCK_STORAGE_KEY_CAMPAIGN = 'xiaomi_pad_8_mock_campaign';

function getMockDonations(): Donation[] {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY_DONATIONS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }

  // Initial demo donations
  const initial: Donation[] = [
    {
      id: 'demo-1',
      payment_method: 'upi',
      native_amount: 1500,
      native_currency: 'INR',
      inr_amount: 1500,
      usd_amount: 17.28,
      fx_rate: 86.8,
      fx_timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'approved',
      display_name: 'Anonymized Contributor',
      show_name: true,
      message: 'Excited for custom ROMs on Pad 8!',
      payment_reference: 'DEMO-UTR-99124',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      approved_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'demo-2',
      payment_method: 'international',
      native_amount: 25,
      native_currency: 'USD',
      inr_amount: 2170,
      usd_amount: 25,
      fx_rate: 86.8,
      fx_timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'approved',
      display_name: 'AlexDev',
      show_name: true,
      message: 'For kernel sources & trees',
      payment_reference: 'DEMO-TX-4401',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      approved_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'demo-3',
      payment_method: 'upi',
      native_amount: 500,
      native_currency: 'INR',
      inr_amount: 500,
      usd_amount: 5.76,
      fx_rate: 86.8,
      fx_timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      status: 'approved',
      display_name: 'Anonymous',
      show_name: false,
      message: null,
      payment_reference: 'DEMO-UTR-77112',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      approved_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    }
  ];

  localStorage.setItem(MOCK_STORAGE_KEY_DONATIONS, JSON.stringify(initial));
  return initial;
}

function saveMockDonations(list: Donation[]) {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY_DONATIONS, JSON.stringify(list));
  } catch {
    // ignore
  }
}

// ==========================================
// PUBLIC API CALLS
// ==========================================

export async function submitDonation(payload: {
  payment_method: 'upi' | 'international';
  native_amount: number;
  native_currency: string;
  payment_reference: string;
  display_name?: string;
  show_name: boolean;
  message?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    // Store in mock storage
    const current = getMockDonations();
    const newDonation: Donation = {
      id: 'mock-' + Date.now(),
      payment_method: payload.payment_method,
      native_amount: payload.native_amount,
      native_currency: payload.native_currency,
      inr_amount: 0,
      usd_amount: 0,
      fx_rate: null,
      fx_timestamp: null,
      status: 'pending',
      display_name: payload.show_name && payload.display_name?.trim() ? payload.display_name.trim() : 'Anonymous',
      show_name: payload.show_name,
      message: payload.message?.trim() || null,
      payment_reference: payload.payment_reference.trim(),
      created_at: new Date().toISOString(),
      approved_at: null,
    };
    current.unshift(newDonation);
    saveMockDonations(current);
    return { success: true };
  }

  try {
    // 1. Try secure RPC function first (bypasses all client-side RLS issues)
    const { error: rpcError } = await supabase.rpc('submit_donation', {
      p_payment_method: payload.payment_method,
      p_native_amount: payload.native_amount,
      p_native_currency: payload.native_currency,
      p_payment_reference: payload.payment_reference.trim(),
      p_display_name: payload.show_name && payload.display_name?.trim() ? payload.display_name.trim() : 'Anonymous',
      p_show_name: payload.show_name,
      p_message: payload.message?.trim() || null
    });

    if (!rpcError) {
      return { success: true };
    }

    // 2. Fallback to direct table insert
    const { error: insertError } = await supabase.from('donations').insert([
      {
        payment_method: payload.payment_method,
        native_amount: payload.native_amount,
        native_currency: payload.native_currency,
        payment_reference: payload.payment_reference.trim(),
        display_name: payload.show_name && payload.display_name?.trim() ? payload.display_name.trim() : 'Anonymous',
        show_name: payload.show_name,
        message: payload.message?.trim() || null,
        status: 'pending'
      }
    ]);

    if (insertError) {
      if (insertError.message.includes('row-level security')) {
        return {
          success: false,
          error: 'Database RLS policy blocked insert. Please run supabase/fix_rls.sql in Supabase SQL Editor.'
        };
      }
      return { success: false, error: insertError.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Submission failed';
    return { success: false, error: msg };
  }
}

function normalizeDonationItem(d: any, fallbackRate: number): PublicDonation {
  const fxRate = Number(d.fx_rate) || fallbackRate || 86.8;
  const nativeAmt = Number(d.native_amount) || 0;
  const curr = (d.native_currency || 'INR').toUpperCase();

  let usd = Number(d.usd_amount) || 0;
  let inr = Number(d.inr_amount) || 0;

  // Auto-calculate if usd_amount is missing or 0 (e.g. manual edit in Supabase table)
  if (usd <= 0 && nativeAmt > 0) {
    if (curr === 'USD') {
      usd = nativeAmt;
    } else if (curr === 'INR') {
      usd = Math.round((nativeAmt / fxRate) * 100) / 100;
    } else if (curr === 'EUR') {
      usd = Math.round((nativeAmt / 0.95) * 100) / 100;
    } else if (curr === 'GBP') {
      usd = Math.round((nativeAmt / 0.81) * 100) / 100;
    } else {
      usd = Math.round((nativeAmt / fxRate) * 100) / 100;
    }
  }

  // Auto-calculate if inr_amount is missing or 0
  if (inr <= 0 && nativeAmt > 0) {
    if (curr === 'INR') {
      inr = Math.round(nativeAmt);
    } else if (curr === 'USD') {
      inr = Math.round(nativeAmt * fxRate);
    } else {
      inr = Math.round(usd * fxRate);
    }
  }

  const displayName = d.show_name && d.display_name && d.display_name.trim() !== ''
    ? d.display_name.trim()
    : 'Anonymous';

  return {
    id: String(d.id),
    payment_method: d.payment_method || 'upi',
    native_amount: nativeAmt,
    native_currency: curr,
    inr_amount: inr,
    usd_amount: usd,
    display_name: displayName,
    message: d.message || null,
    created_at: d.created_at || new Date().toISOString(),
    approved_at: d.approved_at || d.created_at || new Date().toISOString()
  };
}

export async function fetchPublicDonations(): Promise<PublicDonation[]> {
  if (!isSupabaseConfigured || !supabase) {
    const current = getMockDonations();
    return current
      .filter(d => (d.status || '').toLowerCase() === 'approved')
      .map(d => normalizeDonationItem(d, CAMPAIGN_CONFIG.FALLBACK_USD_TO_INR));
  }

  try {
    // 1. Primary: Query donations table directly for approved rows (strictly omitting sensitive payment_reference)
    const { data: tableData, error: tableError } = await supabase
      .from('donations')
      .select('id, payment_method, native_amount, native_currency, inr_amount, usd_amount, fx_rate, status, display_name, show_name, message, created_at, approved_at')
      .in('status', ['approved', 'Approved', 'APPROVED'])
      .order('created_at', { ascending: false });

    if (!tableError && tableData && tableData.length > 0) {
      return tableData.map(d => normalizeDonationItem(d, CAMPAIGN_CONFIG.FALLBACK_USD_TO_INR));
    }

    // 2. Secondary fallback: Query public_donations view if it exists
    const { data: viewData, error: viewError } = await supabase
      .from('public_donations')
      .select('*')
      .order('created_at', { ascending: false });

    if (!viewError && viewData && viewData.length > 0) {
      return viewData.map(d => normalizeDonationItem(d, CAMPAIGN_CONFIG.FALLBACK_USD_TO_INR));
    }

    if (!tableError) return [];
    if (!viewError) return [];

    console.warn('Could not read approved donations from table or view:', tableError || viewError);
    return [];
  } catch (err) {
    console.error('Failed to fetch public donations:', err);
    return [];
  }
}

export async function fetchCampaignData(): Promise<CampaignData> {
  const defaultCampaign: CampaignData = {
    id: 'xiaomi_pad_8',
    usd_goal: CAMPAIGN_CONFIG.COMMUNITY_GOAL_USD,
    device_price_inr: CAMPAIGN_CONFIG.DEVICE_PRICE_INR,
    fundraising_enabled: true,
    campaign_status: 'fundraising',
    payment_url: CAMPAIGN_CONFIG.INTERNATIONAL_PAYMENT_URL,
    upi_id: CAMPAIGN_CONFIG.UPI_ID,
    purchase_status: 'pending',
    purchase_proof_url: '',
    purchase_notes: '',
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured || !supabase) {
    try {
      const raw = localStorage.getItem(MOCK_STORAGE_KEY_CAMPAIGN);
      if (raw) return { ...defaultCampaign, ...JSON.parse(raw) };
    } catch {
      // fallback
    }
    return defaultCampaign;
  }

  try {
    const { data, error } = await supabase
      .from('campaign')
      .select('*')
      .eq('id', 'xiaomi_pad_8')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Error reading campaign:', error);
    }
    return data ? (data as CampaignData) : defaultCampaign;
  } catch (err) {
    console.error('Failed to fetch campaign data:', err);
    return defaultCampaign;
  }
}

export async function fetchFundingSummary(): Promise<FundingSummary> {
  // Always derive directly from normalized approved donations to guarantee 100% sync
  const donations = await fetchPublicDonations();
  const totalUsd = donations.reduce((acc, d) => acc + (d.usd_amount || 0), 0);
  const totalInr = donations.reduce((acc, d) => acc + (d.inr_amount || 0), 0);

  return {
    total_usd_raised: Math.round(totalUsd * 100) / 100,
    total_inr_raised: Math.round(totalInr),
    verified_count: donations.length,
  };
}

// ==========================================
// ADMIN API CALLS (Authenticated)
// ==========================================

export async function fetchAdminDonations(): Promise<{
  pending: Donation[];
  approved: Donation[];
  rejected: Donation[];
}> {
  if (!isSupabaseConfigured || !supabase) {
    const list = getMockDonations();
    return {
      pending: list.filter(d => d.status === 'pending'),
      approved: list.filter(d => d.status === 'approved'),
      rejected: list.filter(d => d.status === 'rejected'),
    };
  }

  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  const list = (data || []) as Donation[];

  return {
    pending: list.filter(d => (d.status || '').toLowerCase() === 'pending'),
    approved: list.filter(d => (d.status || '').toLowerCase() === 'approved'),
    rejected: list.filter(d => (d.status || '').toLowerCase() === 'rejected'),
  };
}

export async function approveDonationAction(
  donation: Donation,
  manualRate?: number
): Promise<{ success: boolean; error?: string }> {
  // Fetch current live rate or use manual override
  const rates = await getLiveRates();
  const fxUsdToInr = manualRate && manualRate > 0 ? manualRate : rates.INR;
  const { usd_amount, inr_amount } = calculateApprovalAmounts(
    donation.native_amount,
    donation.native_currency,
    fxUsdToInr,
    { EUR: rates.EUR, GBP: rates.GBP }
  );

  const approvalData = {
    status: 'approved' as const,
    usd_amount,
    inr_amount,
    fx_rate: fxUsdToInr,
    fx_timestamp: new Date().toISOString(),
    approved_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured || !supabase) {
    const list = getMockDonations();
    const idx = list.findIndex(d => d.id === donation.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...approvalData };
      saveMockDonations(list);
    }
    return { success: true };
  }

  // 1. Try secure RPC function first (bypasses all client-side RLS quirks with SECURITY DEFINER)
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('approve_donation', {
      p_id: donation.id,
      p_usd_amount: usd_amount,
      p_inr_amount: inr_amount,
      p_fx_rate: fxUsdToInr,
    });
    if (!rpcError && rpcData && (rpcData as any).success) {
      return { success: true };
    }
  } catch {
    // Continue to direct table update fallback
  }

  // 2. Direct table update fallback with select
  const { error } = await supabase
    .from('donations')
    .update(approvalData)
    .eq('id', donation.id)
    .select();

  if (error) {
    console.error('Update error on approve:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function rejectDonationAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    const list = getMockDonations();
    const idx = list.findIndex(d => d.id === id);
    if (idx !== -1) {
      list[idx].status = 'rejected';
      saveMockDonations(list);
    }
    return { success: true };
  }

  const { error } = await supabase
    .from('donations')
    .update({ status: 'rejected' })
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateCampaignSettings(
  settings: Partial<CampaignData>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    try {
      const current = await fetchCampaignData();
      const updated = { ...current, ...settings, updated_at: new Date().toISOString() };
      localStorage.setItem(MOCK_STORAGE_KEY_CAMPAIGN, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return { success: true };
  }

  const { error } = await supabase
    .from('campaign')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', 'xiaomi_pad_8');

  if (error) return { success: false, error: error.message };
  return { success: true };
}
