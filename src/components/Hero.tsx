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

  const usdGoal = CAMPAIGN_CONFIG.COMMUNITY_GOAL_USD;
  const inrGoal = CAMPAIGN_CONFIG.COMMUNITY_GOAL_INR;

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
              Crowdfunding a dedicated Xiaomi Pad 8 for Android custom ROM bring-up, kernel patching, device-tree contributions, and stylus input HAL testing.
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
            <span className="font-mono text-[10px] uppercase tracking-wider text-blue-400 block">community goal</span>
            <div className="font-mono mt-1">
              <span className="text-xl sm:text-3xl font-bold text-neutral-100">${usdGoal}</span>
              <span className="text-[11px] text-[var(--muted)] block mt-0.5">(≈ ₹{inrGoal.toLocaleString('en-IN')})</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono block mt-1">Dev covers rest (~$250)</span>
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
                {isGoalReached ? 'goal completed 🎉' : `(≈ ₹${remainingInr.toLocaleString('en-IN')})`}
              </span>
            </div>
          </div>
        </div>

        {/* Minimal Terminal-Style Progress Bar */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between font-mono text-xs text-[var(--muted)] mb-2.5 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-neutral-100 font-bold">{percentage}% FUNDED</span>
              {isGoalReached ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  GOAL COMPLETED 🎉
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  TARGET: $260 (≈ ₹25,000)
                </span>
              )}
            </div>
            <div className="text-right text-[11px]">
              {isGoalReached ? (
                <span className="text-emerald-400 font-medium">All community funds raised! Dev covering rest</span>
              ) : (
                <span>${remainingUsd} to goal (≈ ₹{remainingInr.toLocaleString('en-IN')})</span>
              )}
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="relative h-3.5 sm:h-4 border border-neutral-700 bg-neutral-950 p-0.5 rounded-sm overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ease-out ${
                isGoalReached ? 'bg-emerald-400' : 'bg-neutral-100'
              }`}
              style={{ width: `${animatedWidth}%` }}
            />
          </div>

          {/* 3 Structured Hardware & Co-Funding Cards Down Below (Clean, No Collision, Mobile Optimized) */}
          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
            {/* Card 1: Community Target */}
            <div className={`p-3 rounded-lg border transition-all ${
              isGoalReached
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                : 'bg-neutral-900/60 border-[var(--line)] text-neutral-300'
            }`}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-blue-400">01 // COMMUNITY TARGET</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                  isGoalReached ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {isGoalReached ? '✓ MET' : `${percentage}%`}
                </span>
              </div>
              <div className="font-bold text-base text-neutral-100">
                $260 <span className="text-xs text-[var(--muted)] font-normal">(≈ ₹25,000)</span>
              </div>
              <div className="text-[11px] text-[var(--muted)] mt-1 flex items-center justify-between">
                <span>Base Tablet Bring-Up Fund</span>
                <span className="text-[10px] text-blue-400">Community Goal</span>
              </div>
            </div>

            {/* Card 2: Xiaomi Focus Pen Pro */}
            <div className="p-3 rounded-lg border bg-neutral-900/60 border-[var(--line)] text-neutral-300">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-neutral-200">02 // FOCUS PEN PRO</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-500/20 text-emerald-400">
                  100% DEV COVERED
                </span>
              </div>
              <div className="font-bold text-base text-neutral-100">
                ~$70 <span className="text-xs text-[var(--muted)] font-normal">(≈ ₹6,000)</span>
              </div>
              <div className="text-[11px] text-[var(--muted)] mt-1 flex items-center justify-between">
                <span>16k Pressure Levels • &lt;1ms</span>
                <span className="text-[10px] text-neutral-500">Retail ₹5,999</span>
              </div>
            </div>

            {/* Card 3: Total Package & Dev Co-Funding */}
            <div className="p-3 rounded-lg border bg-neutral-900/60 border-[var(--line)] text-neutral-300">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-neutral-200">03 // TOTAL HARDWARE</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-neutral-800 text-neutral-400">
                  PACKAGE
                </span>
              </div>
              <div className="font-bold text-base text-neutral-100">
                ~$510 <span className="text-xs text-[var(--muted)] font-normal">(≈ ₹44,000)</span>
              </div>
              <div className="text-[11px] text-[var(--muted)] mt-1 flex items-center justify-between">
                <span>Tablet + Pen</span>
                <span className="text-[10px] text-emerald-400">Dev pays ~$250 rest</span>
              </div>
            </div>
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
