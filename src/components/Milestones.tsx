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
    <section className="border-b border-[var(--line)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="font-mono text-xs text-[var(--muted)] mb-2">
              04 // MILESTONES
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
              Funding milestones.
            </h2>
            <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
              Progress marks towards the $350 community target.
            </p>
          </div>

          <div className="md:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {milestones.map((m) => {
                const reached = isMilestoneReached(m);

                return (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-lg border font-mono transition-colors ${
                      reached
                        ? 'bg-neutral-900 border-neutral-600 text-neutral-100'
                        : 'bg-neutral-950/60 border-[var(--line)] text-neutral-500'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          reached ? 'bg-blue-400' : 'bg-neutral-700'
                        }`}
                      />
                      <span className="text-xs font-bold text-neutral-100 truncate">
                        ${m.usdTarget} {m.isFinal && <span className="text-[10px] text-blue-400 font-normal">FINAL</span>}
                      </span>
                    </div>

                    <div className="text-[11px] text-[var(--muted)] truncate">
                      (≈ ₹{m.inrApprox.toLocaleString('en-IN')})
                    </div>

                    <div className="mt-3 pt-2 border-t border-neutral-800/80 text-[10px] uppercase tracking-wider">
                      {reached ? (
                        <span className="text-blue-400 font-semibold">✓ Completed</span>
                      ) : (
                        <span className="text-neutral-600">Pending</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
