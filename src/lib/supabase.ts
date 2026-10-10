import { createClient } from "@supabase/supabase-js";
import {
  PublicDonation,
  Donation,
  CampaignData,
  FundingSummary,
} from "./types";
import { CAMPAIGN_CONFIG } from "../config";
import { getLiveRates, calculateApprovalAmounts } from "./exchangeRate";
import { resolveRuntime } from "./runtime";
import { PREVIEW_DONATIONS } from "./preview";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || "";

export const { isDesignPreview, isSupabaseConfigured } = resolveRuntime(
  import.meta.env,
);
const configurationError =
  "Supabase configuration is required for this operation.";

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function submitDonation(payload: {
  payment_method: "upi" | "international";
  native_amount: number;
  native_currency: string;
  payment_reference: string;
  display_name?: string;
  show_name: boolean;
  message?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: configurationError };
  }

  try {
    // Submit through the database function; the database enforces access and validation.
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "submit_donation",
      {
        p_payment_method: payload.payment_method,
        p_native_amount: payload.native_amount,
        p_native_currency: payload.native_currency,
        p_payment_reference: payload.payment_reference.trim(),
        p_display_name:
          payload.show_name && payload.display_name?.trim()
            ? payload.display_name.trim()
            : "Anonymous",
        p_show_name: payload.show_name,
        p_message: payload.message?.trim() || null,
      },
    );

    if (!rpcError) {
      return rpcData?.success
        ? { success: true }
        : {
            success: false,
            error: rpcData?.error || "Payment details could not be submitted.",
          };
    }

    // Support existing projects without the RPC; never bypass a rejected submission.
    if (!["PGRST202", "42883"].includes(rpcError.code)) {
      return { success: false, error: rpcError.message };
    }
    const { error: insertError } = await supabase.from("donations").insert([
      {
        payment_method: payload.payment_method,
        native_amount: payload.native_amount,
        native_currency: payload.native_currency,
        payment_reference: payload.payment_reference.trim(),
        display_name:
          payload.show_name && payload.display_name?.trim()
            ? payload.display_name.trim()
            : "Anonymous",
        show_name: payload.show_name,
        message: payload.message?.trim() || null,
        status: "pending",
      },
    ]);

    if (insertError) {
      if (insertError.message.includes("row-level security")) {
        return {
          success: false,
          error:
            "The submission could not be saved. Please try again later; the campaign owner needs to check database access.",
        };
      }
      return { success: false, error: insertError.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Submission failed";
    return { success: false, error: msg };
  }
}

function normalizeDonationItem(d: any, fallbackRate: number): PublicDonation {
  const fxRate = Number(d.fx_rate) || fallbackRate || 86.8;
  const nativeAmt = Number(d.native_amount) || 0;
  const curr = (d.native_currency || "INR").toUpperCase();

  let usd = Number(d.usd_amount) || 0;
  let inr = Number(d.inr_amount) || 0;

  // Auto-calculate if usd_amount is missing or 0 (e.g. manual edit in Supabase table)
  if (usd <= 0 && nativeAmt > 0) {
    if (curr === "USD") {
      usd = nativeAmt;
    } else if (curr === "INR") {
      usd = Math.round((nativeAmt / fxRate) * 100) / 100;
    } else if (curr === "EUR") {
      usd = Math.round((nativeAmt / 0.95) * 100) / 100;
    } else if (curr === "GBP") {
      usd = Math.round((nativeAmt / 0.81) * 100) / 100;
    } else {
      usd = Math.round((nativeAmt / fxRate) * 100) / 100;
    }
  }

  // Auto-calculate if inr_amount is missing or 0
  if (inr <= 0 && nativeAmt > 0) {
    if (curr === "INR") {
      inr = Math.round(nativeAmt);
    } else if (curr === "USD") {
      inr = Math.round(nativeAmt * fxRate);
    } else {
      inr = Math.round(usd * fxRate);
    }
  }

  const displayName =
    d.show_name !== false && d.display_name && d.display_name.trim() !== ""
      ? d.display_name.trim()
      : "Anonymous";

  return {
    id: String(d.id),
    payment_method: d.payment_method || "upi",
    native_amount: nativeAmt,
    native_currency: curr,
    inr_amount: inr,
    usd_amount: usd,
    display_name: displayName,
    message: d.message || null,
    created_at: d.created_at || new Date().toISOString(),
    approved_at: d.approved_at || d.created_at || new Date().toISOString(),
  };
}

export async function fetchPublicDonations(): Promise<PublicDonation[]> {
  if (isDesignPreview)
    return PREVIEW_DONATIONS.map((donation) => ({ ...donation }));
  if (!supabase) throw new Error(configurationError);

  try {
    // The view filters approved rows and applies the donor's name preference.
    // Never query the private donations table from the public API.
    const { data, error } = await supabase
      .from("public_donations")
      .select("*")
      .order("approved_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((d) =>
      normalizeDonationItem(d, CAMPAIGN_CONFIG.FALLBACK_USD_TO_INR),
    );
  } catch (err) {
    console.error("Failed to fetch public donations:", err);
    throw err;
  }
}

export async function fetchCampaignData(): Promise<CampaignData> {
  const defaultCampaign: CampaignData = {
    id: "xiaomi_pad_8",
    usd_goal: CAMPAIGN_CONFIG.COMMUNITY_GOAL_USD,
    device_price_inr: CAMPAIGN_CONFIG.DEVICE_PRICE_INR,
    fundraising_enabled: true,
    campaign_status: "fundraising",
    payment_url: CAMPAIGN_CONFIG.INTERNATIONAL_PAYMENT_URL,
    upi_id: CAMPAIGN_CONFIG.UPI_ID,
    purchase_status: "pending",
    purchase_proof_url: "",
    purchase_notes: "",
    updated_at: new Date().toISOString(),
  };

  if (isDesignPreview) return defaultCampaign;
  if (!supabase) throw new Error(configurationError);

  const { data, error } = await supabase
    .from("campaign")
    .select("*")
    .eq("id", "xiaomi_pad_8")
    .single();
  if (error) throw error;
  if (!data) throw new Error("Campaign settings are unavailable.");
  return data as CampaignData;
}

export async function fetchFundingSummary(
  approvedDonations?: PublicDonation[],
): Promise<FundingSummary> {
  // Derive the total from the same approved records displayed on the public list.
  const donations = approvedDonations || (await fetchPublicDonations());
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
  if (!supabase) throw new Error(configurationError);

  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  const list = (data || []) as Donation[];

  return {
    pending: list.filter((d) => (d.status || "").toLowerCase() === "pending"),
    approved: list.filter((d) => (d.status || "").toLowerCase() === "approved"),
    rejected: list.filter((d) => (d.status || "").toLowerCase() === "rejected"),
  };
}

export async function approveDonationAction(
  donation: Donation,
  manualRate?: number,
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: configurationError };
  // Fetch current live rate or use manual override
  const rates = await getLiveRates();
  const fxUsdToInr = manualRate && manualRate > 0 ? manualRate : rates.INR;
  const { usd_amount, inr_amount } = calculateApprovalAmounts(
    donation.native_amount,
    donation.native_currency,
    fxUsdToInr,
    { EUR: rates.EUR, GBP: rates.GBP },
  );

  const approvalData = {
    status: "approved" as const,
    usd_amount,
    inr_amount,
    fx_rate: fxUsdToInr,
    fx_timestamp: new Date().toISOString(),
    approved_at: new Date().toISOString(),
  };

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "approve_donation",
    {
      p_id: donation.id,
      p_usd_amount: usd_amount,
      p_inr_amount: inr_amount,
      p_fx_rate: fxUsdToInr,
    },
  );
  if (!rpcError) {
    return rpcData?.success
      ? { success: true }
      : {
          success: false,
          error: rpcData?.error || "Donation could not be approved.",
        };
  }
  // Compatibility for projects without the RPC. Never bypass an access rejection.
  if (!["PGRST202", "42883"].includes(rpcError.code)) {
    return { success: false, error: rpcError.message };
  }
  const { data, error } = await supabase
    .from("donations")
    .update(approvalData)
    .eq("id", donation.id)
    .eq("status", "pending")
    .select("id");
  if (error) return { success: false, error: error.message };
  if (!data?.length)
    return {
      success: false,
      error: "Donation is no longer pending or you do not have admin access.",
    };

  return { success: true };
}

export async function rejectDonationAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: configurationError };

  const { data, error } = await supabase
    .from("donations")
    .update({ status: "rejected" })
    .eq("id", id)
    .eq("status", "pending")
    .select("id");

  if (error) return { success: false, error: error.message };
  if (!data?.length)
    return {
      success: false,
      error: "Donation is no longer pending or you do not have admin access.",
    };
  return { success: true };
}

export async function updateCampaignSettings(
  settings: Partial<CampaignData>,
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: configurationError };

  const { data, error } = await supabase
    .from("campaign")
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq("id", "xiaomi_pad_8")
    .select("id");

  if (error) return { success: false, error: error.message };
  if (!data?.length)
    return {
      success: false,
      error:
        "Campaign settings could not be updated. Administrator access is required.",
    };
  return { success: true };
}
