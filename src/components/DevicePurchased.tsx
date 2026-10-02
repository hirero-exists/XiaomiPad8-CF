import React from 'react';
import { Tablet, PenTool, Shield, UserCheck, Info } from 'lucide-react';
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
    <section className="py-8 border-b border-zinc-800/60">
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Tablet className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Device being purchased</h2>
              <p className="text-xs text-zinc-400">Target hardware specifications and budget allocation</p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
            <PenTool className="w-3 h-3 text-blue-400" />
            Includes Official Pen
          </span>
        </div>

        {/* Specs and Pricing Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Device Specs & Retail */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">Hardware & Config</span>
              <h3 className="text-sm font-semibold text-zinc-100 mt-1">
                {CAMPAIGN_CONFIG.DEVICE_NAME}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {CAMPAIGN_CONFIG.DEVICE_SPECS}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/80">
              <span className="text-[11px] text-zinc-500 block">Estimated Retail Price</span>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-lg font-bold text-white">₹{devicePriceInr.toLocaleString('en-IN')}</span>
                <span className="text-xs text-zinc-400">(~${devicePriceUsd})</span>
              </div>
            </div>
          </div>

          {/* Card 2: Community Contribution */}
          <div className="bg-blue-950/20 border border-blue-500/25 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-blue-400 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Community Target
              </span>
              <h3 className="text-sm font-semibold text-zinc-100 mt-1">
                Crowdfunding Goal
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Capped target for community supporters
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-500/20">
              <span className="text-[11px] text-zinc-400 block">Community Target</span>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-lg font-bold text-blue-400">${communityGoalUsd}</span>
                <span className="text-xs text-zinc-400">(≈ ₹{communityGoalInr.toLocaleString('en-IN')})</span>
              </div>
            </div>
          </div>

          {/* Card 3: Developer Personal Contribution */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                Developer Share
              </span>
              <h3 className="text-sm font-semibold text-zinc-100 mt-1">
                Remaining Device Cost
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Paid personally by the developer
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/80">
              <span className="text-[11px] text-zinc-500 block">Personal Contribution</span>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-lg font-bold text-emerald-400">≈ ₹{devContributionInr.toLocaleString('en-IN')}</span>
                <span className="text-xs text-zinc-400">(~${devContributionUsd})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transparency Footnote */}
        <div className="mt-4 flex items-start gap-2 text-xs text-zinc-400 bg-zinc-800/30 rounded-lg p-3 border border-zinc-800/60">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-zinc-300">Co-funded purchase:</strong> The community is <span className="underline decoration-zinc-600 underline-offset-2">not</span> being asked to pay the full device price. The community goal covers approximately half of the device cost, and the remaining ₹{devContributionInr.toLocaleString('en-IN')} will be paid personally out of pocket by the developer.
          </p>
        </div>
      </div>
    </section>
  );
};
