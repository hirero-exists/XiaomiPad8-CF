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
    <section className="py-6 sm:py-8 border-b border-neutral-800/80">
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 sm:p-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-4 pb-3 border-b border-neutral-800">
          <div>
            <h2 className="text-base font-semibold text-neutral-100">
              Device being purchased
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {CAMPAIGN_CONFIG.DEVICE_NAME} ({CAMPAIGN_CONFIG.DEVICE_SPECS})
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            Hardware co-funding
          </span>
        </div>

        {/* 3 Metrics: USD main, bracketed INR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Total Cost */}
          <div className="p-3.5 rounded-lg bg-neutral-900/80 border border-neutral-800">
            <span className="text-[11px] font-mono uppercase text-neutral-500 block">Total Device Cost</span>
            <div className="mt-1 font-mono">
              <span className="text-lg font-bold text-neutral-100">~${devicePriceUsd}</span>
              <span className="text-xs text-neutral-400 block sm:inline sm:ml-1.5">(≈ ₹{devicePriceInr.toLocaleString('en-IN')})</span>
            </div>
            <span className="text-[11px] text-neutral-500 block mt-1">Retail price with official pen</span>
          </div>

          {/* Community Goal */}
          <div className="p-3.5 rounded-lg bg-neutral-900/80 border border-neutral-800">
            <span className="text-[11px] font-mono uppercase text-blue-400 block">Community Goal</span>
            <div className="mt-1 font-mono">
              <span className="text-lg font-bold text-neutral-100">${communityGoalUsd}</span>
              <span className="text-xs text-neutral-400 block sm:inline sm:ml-1.5">(≈ ₹{communityGoalInr.toLocaleString('en-IN')})</span>
            </div>
            <span className="text-[11px] text-neutral-500 block mt-1">Capped crowdfund target</span>
          </div>

          {/* Dev Contribution */}
          <div className="p-3.5 rounded-lg bg-neutral-900/80 border border-neutral-800">
            <span className="text-[11px] font-mono uppercase text-neutral-400 block">Developer Contribution</span>
            <div className="mt-1 font-mono">
              <span className="text-lg font-bold text-neutral-100">~${devContributionUsd}</span>
              <span className="text-xs text-neutral-400 block sm:inline sm:ml-1.5">(≈ ₹{devContributionInr.toLocaleString('en-IN')})</span>
            </div>
            <span className="text-[11px] text-neutral-500 block mt-1">Paid personally out-of-pocket</span>
          </div>
        </div>

        {/* Note */}
        <p className="mt-4 text-xs text-neutral-400 leading-relaxed">
          The community is not asked to pay the full device cost. The developer will personally cover the remaining ~${devContributionUsd} (≈ ₹{devContributionInr.toLocaleString('en-IN')}).
        </p>
      </div>
    </section>
  );
};
