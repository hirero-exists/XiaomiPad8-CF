import React from 'react';
import { CampaignData } from '../lib/types';
import { CAMPAIGN_CONFIG } from '../config';
import { CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

interface DevicePurchasedProps {
  campaign: CampaignData;
  fxRate: number;
}

export const DevicePurchased: React.FC<DevicePurchasedProps> = ({ campaign, fxRate }) => {
  const communityGoalUsd = campaign.usd_goal || CAMPAIGN_CONFIG.COMMUNITY_GOAL_USD;
  const communityGoalInr = Math.round(communityGoalUsd * fxRate);

  return (
    <section className="border-b border-[var(--line)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <div className="font-mono text-xs text-[var(--muted)] mb-2">
              03 // HARDWARE ALLOCATION
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
              Hardware tiers & developer guarantee.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              Target device: {CAMPAIGN_CONFIG.DEVICE_NAME} ({CAMPAIGN_CONFIG.DEVICE_SPECS}).
            </p>
          </div>

          <div className="md:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Total Package */}
              <div className="p-4 rounded-lg bg-neutral-900/60 border border-[var(--line)]">
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span>Total Hardware Package</span>
                </div>
                <div className="font-mono mt-1">
                  <span className="text-base sm:text-lg font-bold text-neutral-100">~${CAMPAIGN_CONFIG.TOTAL_PACKAGE_USD}</span>
                  <span className="text-xs text-[var(--muted)] block">(≈ ₹{CAMPAIGN_CONFIG.TOTAL_PACKAGE_INR.toLocaleString('en-IN')})</span>
                </div>
                <span className="text-[11px] text-[var(--muted)] block mt-2">Pad 8 ($440) + Pen Pro ($70)</span>
              </div>

              {/* Community Goal */}
              <div className="p-4 rounded-lg bg-neutral-900/60 border border-[var(--line)]">
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-blue-400 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Community Target</span>
                </div>
                <div className="font-mono mt-1">
                  <span className="text-xl font-bold text-neutral-100">${communityGoalUsd}</span>
                  <span className="text-xs text-[var(--muted)] block">(≈ ₹{communityGoalInr.toLocaleString('en-IN')})</span>
                </div>
                <span className="text-[11px] text-[var(--muted)] block mt-2">Single community goal</span>
              </div>

              {/* Developer Guarantee */}
              <div className="p-4 rounded-lg bg-neutral-900/60 border border-[var(--line)]">
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Developer Co-Funding</span>
                </div>
                <div className="font-mono mt-1">
                  <span className="text-base sm:text-lg font-bold text-neutral-100">~${CAMPAIGN_CONFIG.DEV_COVERED_USD}</span>
                  <span className="text-xs text-emerald-400/90 block">(≈ ₹{CAMPAIGN_CONFIG.DEV_COVERED_INR.toLocaleString('en-IN')})</span>
                </div>
                <span className="text-[11px] text-[var(--muted)] block mt-2">Dev covers pen + rest</span>
              </div>
            </div>

            {/* Note explaining the variants and the developer promise */}
            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed bg-neutral-900/40 p-5 rounded-lg border border-[var(--line)] space-y-4">
              <div>
                <span className="font-mono text-[10px] text-blue-400 uppercase tracking-wider block mb-1">HARDWARE ALLOCATION & CO-FUNDING</span>
                <p className="font-semibold text-neutral-100 text-sm">
                  Complete Device Package: Tablet + Official Stylus
                </p>
                <p className="text-neutral-400 text-xs mt-1">
                  The goal is strictly capped at $260 (≈ ₹25,000). The developer personally covers all remaining costs out-of-pocket:
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* Tablet Allocation */}
                <div className="p-3.5 rounded bg-neutral-950/80 border border-[var(--line)]">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                    <span className="text-blue-400 font-bold">01 // Xiaomi Pad 8 (Base Variant)</span>
                    <span className="text-[11px] text-neutral-400">Retail: ~$440 (≈ ₹38,000)</span>
                  </div>
                  <p className="text-neutral-300 font-sans text-xs leading-relaxed">
                    The base Xiaomi Pad 8 tablet retails for <strong>~$440 (≈ ₹38,000)</strong>. The community is only asked to contribute <strong>$260 (≈ ₹25,000)</strong>. The developer will personally cover the remaining <strong>~$180 (≈ ₹13,000)</strong> out-of-pocket.
                  </p>
                </div>

                {/* Pen Allocation */}
                <div className="p-3.5 rounded bg-neutral-950/80 border border-emerald-500/30 bg-emerald-950/10">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                    <span className="text-emerald-400 font-bold">02 // Xiaomi Focus Pen Pro</span>
                    <span className="text-[11px] text-emerald-400 font-semibold">Retail: ~$70 (≈ ₹6,000) • 100% DEV COVERED</span>
                  </div>
                  <p className="text-neutral-300 font-sans text-xs leading-relaxed">
                    The official <strong>Xiaomi Focus Pen Pro</strong> retails online for approximately <strong>₹5,499 - ₹5,999 (~$70 USD)</strong> (featuring 16,384 levels of pressure sensitivity, active haptics, and &lt;1ms low-latency). <strong>The developer is covering 100% of the stylus cost personally</strong> ($0 from community funds) to ensure stylus HAL and palm-rejection can be fully tested on custom ROMs.
                  </p>
                </div>

                {/* Final Total Summary */}
                <div className="p-3.5 rounded bg-neutral-950/80 border border-blue-500/30">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                    <span className="text-neutral-200 font-bold">03 // Total Hardware Cost & Dev Commitment</span>
                    <span className="text-[11px] text-blue-400 font-semibold">Total: ~$510 (≈ ₹44,000)</span>
                  </div>
                  <p className="text-neutral-300 font-sans text-xs leading-relaxed">
                    Total cost of the tablet and pen comes to <strong>~$510 (≈ ₹44,000)</strong>. The community funds <strong>$260 (≈ ₹25,000)</strong>, and the developer personally pays the remaining <strong>~$250 (≈ ₹19,000)</strong> balance plus all local import taxes, customs duties, and shipping fees.
                  </p>
                </div>
              </div>

              <p className="pt-3 border-t border-neutral-800 text-neutral-400 text-xs">
                <strong>Developer guarantee:</strong> Once the $260 (≈ ₹25,000) community goal is reached, the developer covers the rest personally and orders the hardware immediately to commence bring-up.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
