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

  const mainGoalUsd = CAMPAIGN_CONFIG.MAIN_GOAL_USD;
  const mainGoalInr = CAMPAIGN_CONFIG.MAIN_GOAL_INR;
  const finalGoalUsd = CAMPAIGN_CONFIG.FINAL_GOAL_USD;
  const finalGoalInr = CAMPAIGN_CONFIG.FINAL_GOAL_INR;

  const usdRaised = summary.total_usd_raised;
  const inrRaised = summary.total_inr_raised;

  const remainingMainUsd = Math.max(0, Math.round((mainGoalUsd - usdRaised) * 100) / 100);
  const remainingMainInr = Math.max(0, mainGoalInr - inrRaised);
  const remainingFinalUsd = Math.max(0, Math.round((finalGoalUsd - usdRaised) * 100) / 100);
  const remainingFinalInr = Math.max(0, finalGoalInr - inrRaised);

  const isMainGoalReached = usdRaised >= mainGoalUsd;
  const isFinalGoalReached = usdRaised >= finalGoalUsd || campaign.campaign_status === 'goal_reached';

  const percentageOfMain = Math.round((usdRaised / mainGoalUsd) * 100);
  // Bar width scaled across the full range up to final goal ($400)
  const barPercentage = Math.min(100, Math.max(0, Math.round((usdRaised / finalGoalUsd) * 100)));

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(barPercentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [barPercentage]);

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
            <span className="font-mono text-[10px] uppercase tracking-wider text-blue-400 block">main goal</span>
            <div className="font-mono mt-1">
              <span className="text-xl sm:text-3xl font-bold text-neutral-100">${mainGoalUsd}</span>
              <span className="text-[11px] text-[var(--muted)] block mt-0.5">(≈ ₹{mainGoalInr.toLocaleString('en-IN')})</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono block mt-1">Final (optional): ${finalGoalUsd} (≈ ₹35k)</span>
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
                {isMainGoalReached ? (isFinalGoalReached ? '$0' : `$${remainingFinalUsd}`) : `$${remainingMainUsd}`}
              </span>
              <span className="text-[11px] text-[var(--muted)] block mt-0.5">
                {isMainGoalReached
                  ? (isFinalGoalReached ? 'all goals completed 🎉' : `(≈ ₹${remainingFinalInr.toLocaleString('en-IN')} to final)`)
                  : `(≈ ₹${remainingMainInr.toLocaleString('en-IN')} to main)`}
              </span>
            </div>
          </div>
        </div>

        {/* Minimal Terminal-Style Progress Bar with Milestone Markers */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between font-mono text-xs text-[var(--muted)] mb-2.5 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-neutral-100 font-bold">{percentageOfMain}% OF MAIN GOAL</span>
              {isFinalGoalReached ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ALL TIERS MET 🎉
                </span>
              ) : usdRaised >= 345 ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  TIER 2 MET (+STYLUS)
                </span>
              ) : isMainGoalReached ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  MAIN GOAL REACHED (BASE TABLET)
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                  TARGET: $290 (≈ ₹25k)
                </span>
              )}
            </div>
            <div className="text-right text-[11px]">
              {isMainGoalReached ? (
                <span className="text-emerald-400 font-medium">
                  {isFinalGoalReached ? 'All goals funded!' : `$${remainingFinalUsd} to final optional target`}
                </span>
              ) : (
                <span>${remainingMainUsd} to main goal • Final (optional): $${finalGoalUsd}</span>
              )}
            </div>
          </div>

          {/* Progress Bar Track with Notch Dividers */}
          <div className="relative h-3.5 sm:h-4 border border-neutral-700 bg-neutral-950 p-0.5 rounded-sm overflow-hidden">
            {/* Animated Fill Bar */}
            <div
              className={`h-full transition-all duration-700 ease-out ${
                isFinalGoalReached
                  ? 'bg-emerald-400'
                  : isMainGoalReached
                  ? 'bg-blue-400'
                  : 'bg-neutral-100'
              }`}
              style={{ width: `${animatedWidth}%` }}
            />

            {/* Main Goal Notch: 71.4% ($290) */}
            <div
              className="absolute top-0 bottom-0 w-[2px] z-10 pointer-events-none"
              style={{ left: '71.4%' }}
              title="Main Goal: $290 (₹25k Base Variant)"
            >
              <div className={`h-full w-full ${animatedWidth >= 71.4 ? 'bg-neutral-900/90' : 'bg-neutral-500/70'}`} />
            </div>

            {/* Tier 2 Notch: 85.7% ($345) */}
            <div
              className="absolute top-0 bottom-0 w-[2px] z-10 pointer-events-none"
              style={{ left: '85.7%' }}
              title="Tier 2: $345 (₹30k Upgraded / Stylus)"
            >
              <div className={`h-full w-full ${animatedWidth >= 85.7 ? 'bg-neutral-900/90' : 'bg-neutral-500/70'}`} />
            </div>
          </div>

          {/* 3 Structured Milestone Cards Down Below The Bar (Clean, Zero Collision, Mobile Optimized) */}
          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
            {/* Card 1: Main Goal */}
            <div className={`p-3 rounded-lg border transition-all ${
              usdRaised >= 290
                ? 'bg-blue-950/20 border-blue-500/40 text-blue-200'
                : 'bg-neutral-900/60 border-[var(--line)] text-neutral-300'
            }`}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-blue-400">01 // MAIN GOAL</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                  usdRaised >= 290 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {usdRaised >= 290 ? '✓ MET' : '71.4%'}
                </span>
              </div>
              <div className="font-bold text-base text-neutral-100">
                $290 <span className="text-xs text-[var(--muted)] font-normal">(≈ ₹25,000)</span>
              </div>
              <div className="text-[11px] text-[var(--muted)] mt-1 flex items-center justify-between">
                <span>Base Pad 8 Variant</span>
                <span className="text-[10px] text-neutral-500">Retail ~$440</span>
              </div>
            </div>

            {/* Card 2: Tier 2 */}
            <div className={`p-3 rounded-lg border transition-all ${
              usdRaised >= 345
                ? 'bg-blue-950/20 border-blue-500/40 text-blue-200'
                : 'bg-neutral-900/60 border-[var(--line)] text-neutral-300'
            }`}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-neutral-200">02 // UPGRADED</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                  usdRaised >= 345 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {usdRaised >= 345 ? '✓ MET' : '85.7%'}
                </span>
              </div>
              <div className="font-bold text-base text-neutral-100">
                $345 <span className="text-xs text-[var(--muted)] font-normal">(≈ ₹30,000)</span>
              </div>
              <div className="text-[11px] text-[var(--muted)] mt-1 flex items-center justify-between">
                <span>+ Stylus Pen / RAM</span>
                <span className="text-[10px] text-neutral-500">Retail ~$510</span>
              </div>
            </div>

            {/* Card 3: Final (Optional) */}
            <div className={`p-3 rounded-lg border transition-all ${
              usdRaised >= 400
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                : 'bg-neutral-900/60 border-[var(--line)] text-neutral-300'
            }`}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-emerald-400">03 // FINAL (OPTIONAL)</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                  usdRaised >= 400 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {usdRaised >= 400 ? '✓ MET' : '100%'}
                </span>
              </div>
              <div className="font-bold text-base text-neutral-100">
                $400 <span className="text-xs text-[var(--muted)] font-normal">(≈ ₹35,000)</span>
              </div>
              <div className="text-[11px] text-[var(--muted)] mt-1 flex items-center justify-between">
                <span>Keyboard + Pen + Top Spec</span>
                <span className="text-[10px] text-neutral-500">Retail ~$600</span>
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
