// Central configuration for Xiaomi Pad 8 Crowdfunding

export interface Milestone {
  id: string;
  usdTarget: number;
  inrApprox: number;
  percentage: number;
  label: string;
  tierName: string;
  title: string;
  description: string;
  hardware: string;
  deviceCostUsdApprox: number;
  deviceCostInr: number;
  isFinal?: boolean;
}

export const CAMPAIGN_CONFIG = {
  // Single Community Goal: $260 (≈ ₹25,000)
  COMMUNITY_GOAL_USD: 260,
  COMMUNITY_GOAL_INR: 25000,

  // Hardware Details & Online Market Pricing
  TABLET_NAME: "Xiaomi Pad 8",
  TABLET_SPECS: "Snapdragon 8s Gen 3 • 144Hz 3K Display • Base Variant",
  TABLET_PRICE_USD: 440,
  TABLET_PRICE_INR: 38000,

  PEN_NAME: "Xiaomi Focus Pen Pro",
  PEN_SPECS: "16,384 Pressure Levels • Haptic Feedback • <1ms Latency",
  PEN_PRICE_USD: 70, // Retail price online approx ₹5,499 - ₹5,999 (~$70 USD)
  PEN_PRICE_INR: 6000,

  // Total Hardware Package (Base Pad 8 + Focus Pen Pro)
  TOTAL_PACKAGE_USD: 510, // $440 tablet + $70 pen
  TOTAL_PACKAGE_INR: 44000, // ₹38,000 tablet + ₹6,000 pen

  // Developer Out-of-Pocket Share (Covers remaining tablet + 100% of pen)
  DEV_COVERED_USD: 250, // $510 - $260
  DEV_COVERED_INR: 19000, // ₹44,000 - ₹25,000

  DEVICE_PRICE_USD_APPROX: 510,
  DEVICE_PRICE_INR: 44000,
  FALLBACK_USD_TO_INR: 86.8,

  // Device Details
  DEVICE_NAME: "Xiaomi Pad 8 + Focus Pen Pro",
  DEVICE_SPECS: "Snapdragon 8s Gen 3 • 144Hz 3K Display • Xiaomi Focus Pen Pro (16k Pressure)",
  DEVICE_IMAGE_PATH: "./images/xiaomi-pad-8.png",

  // Payment Configuration
  UPI_ID: import.meta.env.VITE_UPI_ID || "hirero@slc",
  UPI_NAME: "Hirero",
  UPI_QR_IMAGE: import.meta.env.VITE_UPI_QR_URL || "./images/upi-qr.png",
  INTERNATIONAL_PAYMENT_URL: import.meta.env.VITE_INTERNATIONAL_PAYMENT_URL || "https://www.thankyouverymuch.co/xiaomipad8",

  // Single Community Milestone ($260 / ₹25,000)
  MILESTONES: [
    {
      id: 'm1',
      usdTarget: 260,
      inrApprox: 25000,
      percentage: 100,
      label: "$260 (≈ ₹25,000)",
      tierName: "Community Goal",
      title: "Xiaomi Pad 8 + Focus Pen Pro Bring-Up",
      hardware: "Base Pad 8 ($440) + Focus Pen Pro ($70, Dev Covered)",
      deviceCostUsdApprox: 510,
      deviceCostInr: 44000,
      description: "Community funds $260 (≈ ₹25,000). The developer personally covers the remaining ~$180 tablet cost + 100% of the Xiaomi Focus Pen Pro (~$70 / ₹6,000) out-of-pocket for complete ROM bring-up and stylus HAL testing.",
      isFinal: true,
    }
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
