// Central configuration for Xiaomi Pad 8 Crowdfunding

export interface Milestone {
  id: string;
  usdTarget: number;
  inrApprox: number;
  label: string;
  isFinal?: boolean;
}

export const CAMPAIGN_CONFIG = {
  // Goal Settings (USD is primary everywhere)
  COMMUNITY_GOAL_USD: 350,
  DEVICE_PRICE_USD_APPROX: 600,
  DEVICE_PRICE_INR: 52000,
  FALLBACK_USD_TO_INR: 86.8,

  // Device Details
  DEVICE_NAME: "Xiaomi Pad 8",
  DEVICE_SPECS: "12GB RAM + 256GB Storage + Stylus Pen",
  DEVICE_IMAGE_PATH: "./images/xiaomi-pad-8.png",

  // Payment Configuration
  UPI_ID: import.meta.env.VITE_UPI_ID || "developer@upi",
  UPI_NAME: "Xiaomi Pad 8 Dev Fund",
  UPI_QR_IMAGE: import.meta.env.VITE_UPI_QR_URL || "./images/upi-qr-placeholder.svg",
  INTERNATIONAL_PAYMENT_URL: import.meta.env.VITE_INTERNATIONAL_PAYMENT_URL || "https://tyvm.to/xiaomi-pad-8",

  // Milestones: USD primary, INR in brackets
  MILESTONES: [
    { id: 'm1', usdTarget: 230, inrApprox: 20000, label: "$230 (≈ ₹20,000)" },
    { id: 'm2', usdTarget: 290, inrApprox: 25000, label: "$290 (≈ ₹25,000)" },
    { id: 'm3', usdTarget: 345, inrApprox: 30000, label: "$345 (≈ ₹30,000)" },
    { id: 'm4', usdTarget: 350, inrApprox: 30400, label: "$350 Final (≈ ₹30,400)", isFinal: true },
  ] as Milestone[],

  // Community Links
  GITHUB_URL: "https://github.com/",
  TELEGRAM_GROUP_URL: "https://t.me/",
  TELEGRAM_UPDATES_URL: "https://t.me/",

  // Refund Terms
  REFUND_POLICY: {
    primary: "If the funding goal is not reached, we will attempt to return all contributions.",
    upi: "UPI contributions will be refunded manually to the original sender / payment account after verification.",
    international: "Contributions made through third-party payment services will be refunded through the original payment method where supported by that provider.",
    alternative: "If direct platform refunds are unavailable, donors will be contacted to arrange an alternative refund method.",
    fees: "Payment-processing or currency-conversion fees that are not returned by the provider may be non-refundable.",
    assurance: "No collected funds will be used to purchase the device unless the funding requirement is reached. If the target cannot be completed for another reason before the device is purchased, the same refund process will apply."
  }
};
