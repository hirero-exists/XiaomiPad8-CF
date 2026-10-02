export type PaymentMethod = 'upi' | 'international';
export type DonationStatus = 'pending' | 'approved' | 'rejected' | 'refunded';
export type CampaignStatus = 'interest' | 'fundraising' | 'goal_reached' | 'refunds' | 'completed';
export type PurchaseStatus = 'pending' | 'ordered' | 'received';

export interface Donation {
  id: string;
  payment_method: PaymentMethod;
  native_amount: number;
  native_currency: string;
  inr_amount: number;
  usd_amount: number;
  fx_rate: number | null;
  fx_timestamp: string | null;
  status: DonationStatus;
  display_name: string | null;
  show_name: boolean;
  message: string | null;
  payment_reference: string;
  created_at: string;
  approved_at: string | null;
}

export interface PublicDonation {
  id: string;
  payment_method: PaymentMethod;
  native_amount: number;
  native_currency: string;
  inr_amount: number;
  usd_amount: number;
  display_name: string;
  message: string | null;
  created_at: string;
  approved_at: string | null;
}

export interface CampaignData {
  id: string;
  usd_goal: number;
  device_price_inr: number;
  fundraising_enabled: boolean;
  campaign_status: CampaignStatus;
  payment_url: string;
  upi_id: string;
  purchase_status: PurchaseStatus;
  purchase_proof_url: string;
  purchase_notes: string;
  updated_at: string;
}

export interface FundingSummary {
  total_usd_raised: number;
  total_inr_raised: number;
  verified_count: number;
}
