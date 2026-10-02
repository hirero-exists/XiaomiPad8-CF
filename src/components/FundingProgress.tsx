import React, { useEffect, useState } from 'react';
import { FundingSummary, CampaignData } from '../lib/types';

interface FundingProgressProps {
  summary: FundingSummary;
  campaign: CampaignData;
  fxRate: number;
}

export const FundingProgress: React.FC<FundingProgressProps> = ({ summary, campaign, fxRate }) => {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  const usdGoal = campaign.usd_goal || 350;
  const inrGoal = Math.round(usdGoal * fxRate);

  const usdRaised = summary.total_usd_raised;
  const inrRaised = summary.total_inr_raised;

  const percentage = Math.min(100, Math.max(0, Math.round((usdRaised / usdGoal) * 100)));
  const isGoalReached = usdRaised >= usdGoal || campaign.campaign_status === 'goal_reached';

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="py-6 sm:py-8 border-b border-neutral-800/80">
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 sm:p-7">
        {/* Header stats row */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
              Funding Progress
            </div>
            
            {/* USD Main with Bracketed INR */}
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-neutral-100 font-mono tracking-tight">
                ${usdRaised.toLocaleString()}
              </span>
              <span className="text-base sm:text-lg text-neutral-400 font-mono">
                / ${usdGoal} raised
              </span>
              <span className="text-xs sm:text-sm text-neutral-500 font-mono">
                (≈ ₹{inrRaised.toLocaleString('en-IN')} / ≈ ₹{inrGoal.toLocaleString('en-IN')})
              </span>
            </div>
          </div>

          {/* Right percentage */}
          <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start pt-2 sm:pt-0">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-200">
              {percentage}%
            </span>
            <span className="text-[11px] font-mono text-neutral-500">
              {isGoalReached ? 'goal reached' : `${summary.verified_count} verified backers`}
            </span>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full bg-neutral-800 rounded-full h-2.5 sm:h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isGoalReached ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
            style={{ width: `${animatedWidth}%` }}
          />
        </div>

        {/* Footer info line */}
        <div className="mt-4 flex flex-wrap items-center justify-between text-xs font-mono text-neutral-500 gap-2">
          <span>USD is main funding currency • 1 USD ≈ ₹{fxRate.toFixed(2)}</span>
          <span className={isGoalReached ? 'text-emerald-400' : 'text-neutral-400'}>
            {isGoalReached ? 'Goal reached 🎉' : 'Fundraising active'}
          </span>
        </div>
      </div>
    </div>
  );
};
