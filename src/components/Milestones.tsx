import React from 'react';
import { Check } from 'lucide-react';
import { CAMPAIGN_CONFIG } from '../config';

interface MilestonesProps {
  totalUsdRaised: number;
  totalInrRaised: number;
  fxRate: number;
}

export const Milestones: React.FC<MilestonesProps> = ({ totalUsdRaised, totalInrRaised, fxRate }) => {
  const milestones = CAMPAIGN_CONFIG.MILESTONES;

  const isMilestoneReached = (m: (typeof milestones)[0]): boolean => {
    if (m.targetUsd) {
      return totalUsdRaised >= m.targetUsd;
    }
    if (m.targetInr) {
      // Reached if total INR is >= target, OR converted USD meets it
      const inrFromUsd = totalUsdRaised * fxRate;
      return totalInrRaised >= m.targetInr || inrFromUsd >= m.targetInr;
    }
    return false;
  };

  return (
    <div className="py-6 border-b border-zinc-800/60">
      <div className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-4 text-center sm:text-left">
        Milestone Tracker
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {milestones.map((m) => {
          const reached = isMilestoneReached(m);

          return (
            <div
              key={m.id}
              className={`rounded-xl p-3.5 border transition-all text-center flex flex-col items-center justify-center gap-2 ${
                reached
                  ? 'bg-blue-950/20 border-blue-500/30 text-white'
                  : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-500'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    reached
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-800 text-zinc-600 border border-zinc-700'
                  }`}
                >
                  {reached ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  )}
                </div>
                <span className={`text-xs font-semibold font-mono ${reached ? 'text-zinc-200' : 'text-zinc-400'}`}>
                  {m.label}
                </span>
              </div>

              <span className="text-[11px] text-zinc-500">
                {reached ? (
                  <span className="text-blue-400 font-medium">Completed</span>
                ) : (
                  <span>Pending</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
