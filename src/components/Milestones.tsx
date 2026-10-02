import React from 'react';
import { CAMPAIGN_CONFIG } from '../config';

interface MilestonesProps {
  totalUsdRaised: number;
  totalInrRaised: number;
  fxRate: number;
}

export const Milestones: React.FC<MilestonesProps> = ({ totalUsdRaised, totalInrRaised, fxRate }) => {
  const milestones = CAMPAIGN_CONFIG.MILESTONES;

  const isMilestoneReached = (m: (typeof milestones)[0]): boolean => {
    if (totalUsdRaised >= m.usdTarget) return true;
    const inrFromUsd = totalUsdRaised * fxRate;
    return totalInrRaised >= m.inrApprox || inrFromUsd >= m.inrApprox;
  };

  return (
    <div className="py-5 sm:py-6 border-b border-neutral-800/80">
      <div className="text-[11px] uppercase tracking-wider font-mono text-neutral-500 mb-3">
        Milestones
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {milestones.map((m) => {
          const reached = isMilestoneReached(m);

          return (
            <div
              key={m.id}
              className={`rounded-lg p-2.5 sm:p-3 border transition-colors ${
                reached
                  ? 'bg-neutral-900 border-neutral-700 text-neutral-200'
                  : 'bg-neutral-900/30 border-neutral-800/60 text-neutral-500'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    reached ? 'bg-blue-400' : 'bg-neutral-700'
                  }`}
                />
                <span className="text-xs font-mono font-medium text-neutral-200 truncate">
                  ${m.usdTarget} {m.isFinal && <span className="text-[10px] text-blue-400 font-normal">FINAL</span>}
                </span>
              </div>

              <div className="text-[11px] font-mono text-neutral-500 truncate">
                (≈ ₹{m.inrApprox.toLocaleString('en-IN')})
              </div>

              <div className="mt-2 text-[10px] font-mono uppercase tracking-wider">
                {reached ? (
                  <span className="text-blue-400 font-medium">✓ Reached</span>
                ) : (
                  <span className="text-neutral-600">Pending</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
