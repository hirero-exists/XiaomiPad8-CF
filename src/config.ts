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
  // Goal Settings (USD is primary everywhere, with ₹35,000 final milestone)
  COMMUNITY_GOAL_USD: 400,
  COMMUNITY_GOAL_INR: 35000,
  DEVICE_PRICE_USD_APPROX: 600,
  DEVICE_PRICE_INR: 52000,
  FALLBACK_USD_TO_INR: 86.8,

  // Device Details
  DEVICE_NAME: "Xiaomi Pad 8",
  DEVICE_SPECS: "Snapdragon 8s Gen 3 • 144Hz 3K Display • Up to 12GB+256GB",
  DEVICE_IMAGE_PATH: "./images/xiaomi-pad-8.png",

  // Payment Configuration
  UPI_ID: import.meta.env.VITE_UPI_ID || "hirero@slc",
  UPI_NAME: "Hirero",
  UPI_QR_IMAGE: import.meta.env.VITE_UPI_QR_URL || "./images/upi-qr.png",
  INTERNATIONAL_PAYMENT_URL: import.meta.env.VITE_INTERNATIONAL_PAYMENT_URL || "https://www.thankyouverymuch.co/xiaomipad8",

  // 3 Milestones: $290 (≈ ₹25k, 71.4%), $345 (≈ ₹30k, 85.7%), $400 (≈ ₹35k, 100% Final)
  MILESTONES: [
    {
      id: 'm1',
      usdTarget: 290,
      inrApprox: 25000,
      percentage: 71.4,
      label: "$290 (≈ ₹25,000)",
      tierName: "Tier 1",
      title: "Base Pad 8 Variant",
      hardware: "Base Variant Tablet",
      deviceCostUsdApprox: 440,
      deviceCostInr: 38000,
      description: "If $290 (≈ ₹25,000) is reached, as the base tablet costs ~$440 (≈ ₹38,000), the developer will cover the rest personally to begin kernel & custom ROM bring-up.",
    },
    {
      id: 'm2',
      usdTarget: 345,
      inrApprox: 30000,
      percentage: 85.7,
      label: "$345 (≈ ₹30,000)",
      tierName: "Tier 2",
      title: "Higher Variant / Stylus",
      hardware: "Upgraded Spec OR Official Stylus Pen",
      deviceCostUsdApprox: 510,
      deviceCostInr: 44000,
      description: "If $345 (≈ ₹30,000) is reached, as the upgraded variant or stylus package costs ~$510 (≈ ₹44,000), the developer will cover the rest personally for low-latency input HAL testing.",
    },
    {
      id: 'm3',
      usdTarget: 400,
      inrApprox: 35000,
      percentage: 100,
      label: "$400 Final (≈ ₹35,000)",
      tierName: "Final Goal",
      title: "Top Variant + Full Accessories",
      hardware: "Top-Tier Spec + Keyboard + Stylus Pen",
      deviceCostUsdApprox: 600,
      deviceCostInr: 52000,
      description: "If $400 (≈ ₹35,000) is reached, as the highest variant + full keyboard & pen accessories costs ~$600 (≈ ₹52,000), the developer will cover the rest personally for complete workstation mode.",
      isFinal: true,
    },
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
