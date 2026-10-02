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

export async function fetchPublicDonations(): Promise<PublicDonation[]> {
  if (!isSupabaseConfigured || !supabase) {
    const current = getMockDonations();
    return current
      .filter(d => d.status === 'approved')
      .map(d => ({
        id: d.id,
        payment_method: d.payment_method,
        native_amount: d.native_amount,
        native_currency: d.native_currency,
        inr_amount: d.inr_amount,
        usd_amount: d.usd_amount,
        display_name: d.show_name && d.display_name ? d.display_name : 'Anonymous',
        message: d.message,
        created_at: d.created_at,
        approved_at: d.approved_at
      }));
  }

  try {
    // Note: We query the secure view public_donations which does not have payment_reference
    const { data, error } = await supabase
      .from('public_donations')
      .select('*')
      .order('approved_at', { ascending: false });

    if (error) throw error;
    return (data || []) as PublicDonation[];
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
  if (!isSupabaseConfigured || !supabase) {
    const approved = getMockDonations().filter(d => d.status === 'approved');
    const totalUsd = approved.reduce((acc, d) => acc + (d.usd_amount || 0), 0);
    const totalInr = approved.reduce((acc, d) => acc + (d.inr_amount || 0), 0);
    return {
      total_usd_raised: Math.round(totalUsd * 100) / 100,
      total_inr_raised: Math.round(totalInr),
      verified_count: approved.length,
    };
  }

  try {
    // Try the RPC first
    const { data, error } = await supabase.rpc('get_funding_summary');
    if (!error && data) {
      return {
        total_usd_raised: Number(data.total_usd_raised) || 0,
        total_inr_raised: Number(data.total_inr_raised) || 0,
        verified_count: Number(data.verified_count) || 0,
      };
    }

    // Fallback: calculate from public view
    const donations = await fetchPublicDonations();
    const totalUsd = donations.reduce((acc, d) => acc + (d.usd_amount || 0), 0);
    const totalInr = donations.reduce((acc, d) => acc + (d.inr_amount || 0), 0);
    return {
      total_usd_raised: Math.round(totalUsd * 100) / 100,
      total_inr_raised: Math.round(totalInr),
      verified_count: donations.length,
    };
  } catch (err) {
    console.error('Failed to fetch funding summary:', err);
    return { total_usd_raised: 0, total_inr_raised: 0, verified_count: 0 };
  }
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
    pending: list.filter(d => d.status === 'pending'),
    approved: list.filter(d => d.status === 'approved'),
    rejected: list.filter(d => d.status === 'rejected'),
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

  const { error } = await supabase
    .from('donations')
    .update(approvalData)
    .eq('id', donation.id);

  if (error) return { success: false, error: error.message };
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
