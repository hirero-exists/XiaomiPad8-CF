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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <div className="font-mono text-xs text-[var(--muted)] mb-2">
              04 // MILESTONES & TIERS
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
              Hardware tiers & goal milestones.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              Targeting up to ${CAMPAIGN_CONFIG.COMMUNITY_GOAL_USD} (≈ ₹{CAMPAIGN_CONFIG.COMMUNITY_GOAL_INR.toLocaleString('en-IN')}). Reaching higher milestones allows purchasing higher spec hardware or official accessories (pen / keyboard).
            </p>
          </div>

          <div className="md:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {milestones.map((m) => {
                const reached = isMilestoneReached(m);
                const progressToTier = Math.min(100, Math.max(0, Math.round((totalUsdRaised / m.usdTarget) * 100)));

                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-lg border font-mono transition-all flex flex-col justify-between ${
                      reached
                        ? 'bg-neutral-900 border-neutral-600 text-neutral-100 shadow-sm'
                        : 'bg-neutral-950/60 border-[var(--line)] text-neutral-400'
                    }`}
                  >
                    <div>
                      {/* Top tier badge & percentage */}
                      <div className="flex items-center justify-between gap-1.5 mb-2.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            reached
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                          }`}
                        >
                          {m.percentage}% // {m.tierName}
                        </span>
                        {reached ? (
                          <span className="text-[10px] text-emerald-400 font-semibold">✓ UNLOCKED</span>
                        ) : (
                          <span className="text-[10px] text-neutral-500">PENDING</span>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="mt-1">
                        <span className="text-xl font-bold text-neutral-100">
                          ${m.usdTarget}
                        </span>
                        <span className="text-xs text-[var(--muted)] block">
                          (≈ ₹{m.inrApprox.toLocaleString('en-IN')})
                        </span>
                      </div>

                      {/* Title */}
                      <div className="mt-3">
                        <span className="text-xs font-bold text-neutral-200 block">
                          {m.title}
                        </span>
                        <span className="text-[11px] text-blue-400/90 block mt-0.5">
                          {m.hardware}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="mt-2 text-[11px] text-neutral-400 leading-relaxed font-sans">
                        {m.description}
                      </p>
                    </div>

                    {/* Progress to tier */}
                    <div className="mt-4 pt-3 border-t border-neutral-800/80">
                      <div className="flex justify-between text-[10px] text-[var(--muted)] mb-1">
                        <span>Progress</span>
                        <span>{progressToTier}%</span>
                      </div>
                      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            reached ? 'bg-emerald-400' : 'bg-neutral-200'
                          }`}
                          style={{ width: `${progressToTier}%` }}
                        />
                      </div>
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
