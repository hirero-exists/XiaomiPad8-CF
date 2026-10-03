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
              {/* Target Device */}
              <div className="p-4 rounded-lg bg-neutral-900/60 border border-[var(--line)]">
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span>Target Hardware</span>
                </div>
                <div className="font-mono mt-1">
                  <span className="text-base sm:text-lg font-bold text-neutral-100">{CAMPAIGN_CONFIG.DEVICE_NAME}</span>
                  <span className="text-xs text-[var(--muted)] block">Snapdragon 8s Gen 3</span>
                </div>
                <span className="text-[11px] text-[var(--muted)] block mt-2">144Hz 3K Display</span>
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
                <span className="text-[11px] text-[var(--muted)] block mt-2">3 tiers: ₹25k, ₹30k, ₹35k</span>
              </div>

              {/* Developer Guarantee */}
              <div className="p-4 rounded-lg bg-neutral-900/60 border border-[var(--line)]">
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Developer Guarantee</span>
                </div>
                <div className="font-mono mt-1">
                  <span className="text-base sm:text-lg font-bold text-neutral-100">Dev Covers The Rest</span>
                  <span className="text-xs text-emerald-400/90 block">Once goal is reached</span>
                </div>
                <span className="text-[11px] text-[var(--muted)] block mt-2">Shipping, taxes & balance</span>
              </div>
            </div>

            {/* Note explaining the variants and the developer promise */}
            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed bg-neutral-900/40 p-5 rounded-lg border border-[var(--line)] space-y-4">
              <div>
                <span className="font-mono text-[10px] text-blue-400 uppercase tracking-wider block mb-1">CO-FUNDING TRANSPARENCY</span>
                <p className="font-semibold text-neutral-100 text-sm">
                  How community goals and developer co-funding work:
                </p>
                <p className="text-neutral-400 text-xs mt-1">
                  The community is only asked to fund a base contribution. Whichever milestone tier is reached, the developer personally pays the rest out-of-pocket:
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* Tier 1 */}
                <div className="p-3.5 rounded bg-neutral-950/80 border border-[var(--line)]">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                    <span className="text-blue-400 font-bold">Tier 1 Goal: $290 (≈ ₹25,000) // 71.4%</span>
                    <span className="text-[11px] text-neutral-400">Retail Cost: ~$440 (≈ ₹38,000)</span>
                  </div>
                  <p className="text-neutral-300 font-sans text-xs leading-relaxed">
                    If <strong>$290 (≈ ₹25,000)</strong> is reached, as the base tablet costs <strong>~$440 (≈ ₹38,000)</strong>, the developer will cover the rest personally to purchase the base variant for core kernel patching, device-tree bring-up, and custom ROM development.
                  </p>
                </div>

                {/* Tier 2 */}
                <div className="p-3.5 rounded bg-neutral-950/80 border border-[var(--line)]">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                    <span className="text-blue-400 font-bold">Tier 2 Goal: $345 (≈ ₹30,000) // 85.7%</span>
                    <span className="text-[11px] text-neutral-400">Retail Cost: ~$510 (≈ ₹44,000)</span>
                  </div>
                  <p className="text-neutral-300 font-sans text-xs leading-relaxed">
                    If <strong>$345 (≈ ₹30,000)</strong> is reached, as the upgraded variant or tablet + official stylus package costs <strong>~$510 (≈ ₹44,000)</strong>, the developer will cover the rest personally for pressure sensitivity & input HAL testing.
                  </p>
                </div>

                {/* Tier 3 */}
                <div className="p-3.5 rounded bg-neutral-950/80 border border-blue-500/30 bg-blue-950/10">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                    <span className="text-emerald-400 font-bold">Tier 3 Final Goal: $400 (≈ ₹35,000) // 100%</span>
                    <span className="text-[11px] text-neutral-400">Retail Cost: ~$600 (≈ ₹52,000)</span>
                  </div>
                  <p className="text-neutral-300 font-sans text-xs leading-relaxed">
                    Same applies if <strong>$400 (≈ ₹35,000)</strong> is reached: as the highest variant + full official magnetic keyboard & stylus accessories costs <strong>~$600 (≈ ₹52,000)</strong>, the developer will cover the rest personally to test desktop workstation mode and full ecosystem HALs.
                  </p>
                </div>
              </div>

              <p className="pt-3 border-t border-neutral-800 text-neutral-400 text-xs">
                <strong>Developer guarantee:</strong> Once the community funding goal is reached, the developer covers all remaining device cost, local import taxes, customs duties, and shipping out-of-pocket.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
