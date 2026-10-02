import React, { useEffect, useState } from 'react';
import { CAMPAIGN_CONFIG } from '../config';
import { CampaignData, FundingSummary } from '../lib/types';

interface HeroProps {
  campaign: CampaignData;
  summary: FundingSummary;
  fxRate: number;
  onNavigateToDashboard: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  campaign,
  summary,
  fxRate,
  onNavigateToDashboard
}) => {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  const usdGoal = campaign.usd_goal || 350;
  const inrGoal = Math.round(usdGoal * fxRate);

  const usdRaised = summary.total_usd_raised;
  const inrRaised = summary.total_inr_raised;

  const remainingUsd = Math.max(0, Math.round((usdGoal - usdRaised) * 100) / 100);
  const remainingInr = Math.max(0, inrGoal - inrRaised);

  const percentage = Math.min(100, Math.max(0, Math.round((usdRaised / usdGoal) * 100)));
  const isGoalReached = usdRaised >= usdGoal || campaign.campaign_status === 'goal_reached';

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <section className="relative overflow-hidden border-b border-[var(--line)]">
      {/* Subtle grid background */}
      <div className="absolute inset-0 grid-bg opacity-70 pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-18">
        {/* Section indicator */}
        <div className="font-mono text-xs text-[var(--muted)] mb-3 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
          <span>01 // CAMPAIGN</span>
        </div>

        {/* Hero Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-100 leading-tight">
              Help Fund a Xiaomi Pad 8 for Custom ROM Development.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
              Crowdfunding a dedicated Xiaomi Pad 8 for Android custom ROM bring-up, kernel patching, device-tree contributions, and long-term community support.
            </p>
          </div>

          {/* Product illustration */}
          <div className="md:col-span-4 flex justify-center">
            <div className="max-w-[260px] sm:max-w-[300px] w-full">
              <img
                src={CAMPAIGN_CONFIG.DEVICE_IMAGE_PATH}
                alt="Xiaomi Pad 8 Tablet"
                className="w-full h-auto object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] select-none"
                loading="eager"
              />
            </div>
          </div>
        </div>

        {/* 4-COLUMN STAT STRIP (USD Main, Bracketed INR) */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 border-y border-[var(--line)]">
          <div className="border-r border-[var(--line)] px-3 sm:px-5 py-4 sm:py-5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] block">raised</span>
            <div className="font-mono mt-1">
              <span className="text-xl sm:text-3xl font-bold text-neutral-100">${usdRaised}</span>
              <span className="text-[11px] text-[var(--muted)] block mt-0.5">(≈ ₹{inrRaised.toLocaleString('en-IN')})</span>
            </div>
          </div>

          <div className="sm:border-r border-[var(--line)] px-3 sm:px-5 py-4 sm:py-5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] block">goal</span>
            <div className="font-mono mt-1">
              <span className="text-xl sm:text-3xl font-bold text-neutral-100">${usdGoal}</span>
              <span className="text-[11px] text-[var(--muted)] block mt-0.5">(≈ ₹{inrGoal.toLocaleString('en-IN')})</span>
            </div>
          </div>

          <div className="border-t sm:border-t-0 border-r border-[var(--line)] px-3 sm:px-5 py-4 sm:py-5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] block">donations</span>
            <div className="font-mono mt-1">
              <span className="text-xl sm:text-3xl font-bold text-neutral-100">{summary.verified_count}</span>
              <span className="text-[11px] text-[var(--muted)] block mt-0.5">approved backers</span>
            </div>
          </div>

          <div className="border-t sm:border-t-0 px-3 sm:px-5 py-4 sm:py-5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] block">remaining</span>
            <div className="font-mono mt-1">
              <span className="text-xl sm:text-3xl font-bold text-neutral-100">
                {isGoalReached ? '$0' : `$${remainingUsd}`}
              </span>
              <span className="text-[11px] text-[var(--muted)] block mt-0.5">
                {isGoalReached ? 'goal completed' : `(≈ ₹${remainingInr.toLocaleString('en-IN')})`}
              </span>
            </div>
          </div>
        </div>

        {/* Minimal Terminal-Style Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between font-mono text-xs text-[var(--muted)] mb-2">
            <span>{percentage}% FUNDED</span>
            <span>{isGoalReached ? 'GOAL COMPLETED 🎉' : `$${remainingUsd} TO GO`}</span>
          </div>
          <div className="h-3 border border-neutral-700 bg-neutral-950 p-0.5 rounded-sm overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ease-out ${
                isGoalReached ? 'bg-emerald-400' : 'bg-neutral-100'
              }`}
              style={{ width: `${animatedWidth}%` }}
            />
          </div>
        </div>

        {/* Call to action buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-xs">
          <a
            href="#payment-methods"
            className="px-5 py-2.5 rounded bg-neutral-100 text-neutral-950 font-semibold hover:bg-white active:scale-98 transition-all"
          >
            Donate →
          </a>
          <button
            onClick={onNavigateToDashboard}
            className="px-5 py-2.5 rounded border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
          >
            View dashboard →
          </button>
          <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline ml-2">
            1 USD ≈ ₹{fxRate.toFixed(2)}
          </span>
        </div>
      </div>
    </section>
  );
};
