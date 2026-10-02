import React from 'react';
import { CampaignData } from '../lib/types';
import { CAMPAIGN_CONFIG } from '../config';

interface DevicePurchasedProps {
  campaign: CampaignData;
  fxRate: number;
}

export const DevicePurchased: React.FC<DevicePurchasedProps> = ({ campaign, fxRate }) => {
  const devicePriceInr = campaign.device_price_inr || CAMPAIGN_CONFIG.DEVICE_PRICE_INR;
  const devicePriceUsd = Math.round(devicePriceInr / fxRate);

  const communityGoalUsd = campaign.usd_goal || CAMPAIGN_CONFIG.COMMUNITY_GOAL_USD;
  const communityGoalInr = Math.round(communityGoalUsd * fxRate);

  const devContributionInr = Math.max(0, devicePriceInr - communityGoalInr);
  const devContributionUsd = Math.round(devContributionInr / fxRate);

  return (
    <section className="border-b border-[var(--line)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="font-mono text-xs text-[var(--muted)] mb-2">
              03 // HARDWARE ALLOCATION
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
              Hardware specs & developer co-funding.
            </h2>
            <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
              Target device: {CAMPAIGN_CONFIG.DEVICE_NAME} ({CAMPAIGN_CONFIG.DEVICE_SPECS})
            </p>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Total Device Cost */}
              <div className="p-4 rounded-lg bg-neutral-900/60 border border-[var(--line)]">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] block">Total Device Cost</span>
                <div className="font-mono mt-1">
                  <span className="text-xl font-bold text-neutral-100">~${devicePriceUsd}</span>
                  <span className="text-xs text-[var(--muted)] block">(≈ ₹{devicePriceInr.toLocaleString('en-IN')})</span>
                </div>
                <span className="text-[11px] text-[var(--muted)] block mt-2">Retail cost with pen</span>
              </div>

              {/* Community Goal */}
              <div className="p-4 rounded-lg bg-neutral-900/60 border border-[var(--line)]">
                <span className="font-mono text-[10px] uppercase tracking-wider text-blue-400 block">Community Target</span>
                <div className="font-mono mt-1">
                  <span className="text-xl font-bold text-neutral-100">${communityGoalUsd}</span>
                  <span className="text-xs text-[var(--muted)] block">(≈ ₹{communityGoalInr.toLocaleString('en-IN')})</span>
                </div>
                <span className="text-[11px] text-[var(--muted)] block mt-2">Capped community share</span>
              </div>

              {/* Developer Contribution */}
              <div className="p-4 rounded-lg bg-neutral-900/60 border border-[var(--line)]">
                <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-300 block">Developer Share</span>
                <div className="font-mono mt-1">
                  <span className="text-xl font-bold text-neutral-100">~${devContributionUsd}</span>
                  <span className="text-xs text-[var(--muted)] block">(≈ ₹{devContributionInr.toLocaleString('en-IN')})</span>
                </div>
                <span className="text-[11px] text-[var(--muted)] block mt-2">Paid out-of-pocket</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed bg-neutral-900/40 p-3.5 rounded-lg border border-[var(--line)]">
              <strong>Transparent allocation:</strong> The community is not being asked to pay the full device cost. The developer will personally cover the remaining ~${devContributionUsd} (≈ ₹{devContributionInr.toLocaleString('en-IN')}) to secure the device.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
