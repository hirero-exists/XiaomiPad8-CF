import { PublicDonation } from "./types";

// Read-only fixtures for the explicitly selected development preview.
// No payment references, authentication state, or browser persistence.
export const PREVIEW_DONATIONS: PublicDonation[] = [
  {
    id: "sample-1",
    payment_method: "upi",
    native_amount: 1000,
    native_currency: "INR",
    inr_amount: 1000,
    usd_amount: 10.4,
    display_name: "Sample contributor",
    message: null,
    created_at: "2026-10-01T00:00:00Z",
    approved_at: "2026-10-01T00:00:00Z",
  },
  {
    id: "sample-2",
    payment_method: "international",
    native_amount: 25,
    native_currency: "USD",
    inr_amount: 2404,
    usd_amount: 25,
    display_name: "Anonymous",
    message: null,
    created_at: "2026-09-30T00:00:00Z",
    approved_at: "2026-09-30T00:00:00Z",
  },
];
