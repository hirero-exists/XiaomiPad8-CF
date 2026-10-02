import React, { useEffect, useState } from 'react';
import { TrendingUp, Users } from 'lucide-react';
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
    // Subtle initial animation on load
    const timer = setTimeout(() => {
      setAnimatedWidth(percentage);
    }, 120);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="py-8 border-b border-zinc-800/60">
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle accent corner highlight */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Community Funding Progress</span>
            </div>
            
            {/* Primary USD Goal Display */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono">
                ${usdRaised.toLocaleString()}
              </span>
              <span className="text-lg sm:text-xl font-medium text-zinc-400">
                / ${usdGoal} raised
              </span>
            </div>

            {/* Approximate INR Equivalent */}
            <div className="mt-1 text-sm sm:text-base font-medium text-zinc-400 font-mono">
              ≈ ₹{inrRaised.toLocaleString('en-IN')} raised{' '}
              <span className="text-zinc-500">
                of ≈ ₹{inrGoal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Right badge / percentage */}
          <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-800">
            <span className="text-3xl sm:text-4xl font-bold font-mono text-white">
              {percentage}%
            </span>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              {isGoalReached ? 'Goal Reached' : 'Funded'}
            </span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-zinc-800/90 rounded-full h-4 p-0.5 overflow-hidden border border-zinc-700/50 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
              isGoalReached
                ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
            }`}
            style={{ width: `${animatedWidth}%` }}
          >
            {/* Very subtle shimmer effect */}
            <div className="absolute inset-0 bg-white/10 rounded-full opacity-50" />
          </div>
        </div>

        {/* Quick Micro-Stats Bar */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-zinc-400">
          <div>
            <span className="text-zinc-500 block mb-0.5">Target USD</span>
            <span className="text-zinc-200 font-medium font-mono">${usdGoal}</span>
          </div>
          <div>
            <span className="text-zinc-500 block mb-0.5">Current Rate</span>
            <span className="text-zinc-200 font-medium font-mono">1 USD ≈ ₹{fxRate.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-zinc-500 block mb-0.5">Verified Backers</span>
            <span className="text-zinc-200 font-medium font-mono flex items-center gap-1">
              <Users className="w-3 h-3 text-zinc-400" />
              {summary.verified_count}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block mb-0.5">Status</span>
            <span className={`font-medium ${isGoalReached ? 'text-emerald-400' : 'text-blue-400'}`}>
              {isGoalReached ? 'Goal Completed' : 'Accepting Support'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
