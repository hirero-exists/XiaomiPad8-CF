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
            <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed bg-neutral-900/40 p-4 rounded-lg border border-[var(--line)] space-y-2.5">
              <p className="font-medium text-neutral-200">
                Tiered hardware allocation:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-neutral-400 text-xs font-mono">
                <li><strong className="text-neutral-200">Tier 1 (₹25,000 / 71.4%):</strong> Base Xiaomi Pad 8 variant for ROM and kernel bring-up.</li>
                <li><strong className="text-neutral-200">Tier 2 (₹30,000 / 85.7%):</strong> Higher RAM/Storage variant or official Stylus Pen for input testing.</li>
                <li><strong className="text-neutral-200">Tier 3 (₹35,000 / 100% Final):</strong> Top-tier variant + official Keyboard & Stylus accessories for complete ecosystem HALs.</li>
              </ul>
              <p className="pt-2.5 border-t border-neutral-800 text-neutral-400 text-xs">
                <strong>Developer commitment:</strong> Once the goal is reached, the developer will cover the rest personally — including any remaining hardware balance, local import duties, customs, and shipping costs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
