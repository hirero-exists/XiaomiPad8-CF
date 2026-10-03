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
              04 // FUNDING & HARDWARE
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
              Community goal & hardware package.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              One single community milestone of ${CAMPAIGN_CONFIG.COMMUNITY_GOAL_USD} (≈ ₹{CAMPAIGN_CONFIG.COMMUNITY_GOAL_INR.toLocaleString('en-IN')}). The developer personally covers all remaining costs and 100% of the official stylus pen.
            </p>
          </div>

          <div className="md:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Community Goal */}
              <div
                className={`p-4 rounded-lg border font-mono transition-all flex flex-col justify-between ${
                  isMilestoneReached(milestones[0])
                    ? 'bg-neutral-900 border-neutral-600 text-neutral-100 shadow-sm'
                    : 'bg-neutral-950/60 border-[var(--line)] text-neutral-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-2.5">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      COMMUNITY GOAL
                    </span>
                    {isMilestoneReached(milestones[0]) ? (
                      <span className="text-[10px] text-emerald-400 font-semibold">✓ UNLOCKED</span>
                    ) : (
                      <span className="text-[10px] text-neutral-400">ACTIVE</span>
                    )}
                  </div>

                  <div className="mt-1">
                    <span className="text-xl font-bold text-neutral-100">
                      $290
                    </span>
                    <span className="text-xs text-[var(--muted)] block">
                      (≈ ₹25,000)
                    </span>
                  </div>

                  <div className="mt-2 py-1 px-2 rounded bg-neutral-950/80 border border-neutral-800 text-[10px]">
                    <span className="text-neutral-400 block font-mono">Retail Tablet: ~$440 (≈ ₹38,000)</span>
                    <span className="text-blue-400 font-sans font-medium block mt-0.5">Community Share: 57%</span>
                  </div>

                  <div className="mt-3">
                    <span className="text-xs font-bold text-neutral-200 block">
                      Xiaomi Pad 8 Bring-Up Fund
                    </span>
                    <span className="text-[11px] text-blue-400/90 block mt-0.5">
                      Base Tablet (Snapdragon 8s Gen 3)
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] text-neutral-400 leading-relaxed font-sans">
                    Physical hardware for kernel bring-up, device-tree contributions, and AOSP/LineageOS custom ROM booting.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800/80">
                  <div className="flex justify-between text-[10px] text-[var(--muted)] mb-1">
                    <span>Progress</span>
                    <span>{Math.min(100, Math.round((totalUsdRaised / 290) * 100))}%</span>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 bg-blue-400"
                      style={{ width: `${Math.min(100, Math.round((totalUsdRaised / 290) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Xiaomi Focus Pen Pro */}
              <div className="p-4 rounded-lg border font-mono transition-all flex flex-col justify-between bg-neutral-950/60 border-[var(--line)] text-neutral-300">
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-2.5">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      100% DEV COVERED
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">$0 COMMUNITY</span>
                  </div>

                  <div className="mt-1">
                    <span className="text-xl font-bold text-neutral-100">
                      ~$70
                    </span>
                    <span className="text-xs text-[var(--muted)] block">
                      (≈ ₹6,000)
                    </span>
                  </div>

                  <div className="mt-2 py-1 px-2 rounded bg-neutral-950/80 border border-neutral-800 text-[10px]">
                    <span className="text-neutral-400 block font-mono">Market Price: ₹5,499 - ₹5,999</span>
                    <span className="text-emerald-400 font-sans font-medium block mt-0.5">Paid by Dev Out-Of-Pocket</span>
                  </div>

                  <div className="mt-3">
                    <span className="text-xs font-bold text-neutral-200 block">
                      Xiaomi Focus Pen Pro
                    </span>
                    <span className="text-[11px] text-emerald-400/90 block mt-0.5">
                      16,384 Pressure • Haptics • &lt;1ms
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] text-neutral-400 leading-relaxed font-sans">
                    Developer covers 100% of the official stylus pen cost to ensure stylus latency, palm-rejection, and drawing HALs work out-of-the-box.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800/80">
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Developer Guaranteed</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Total Package Cost */}
              <div className="p-4 rounded-lg border font-mono transition-all flex flex-col justify-between bg-neutral-950/60 border-[var(--line)] text-neutral-300">
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-2.5">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-neutral-700">
                      TOTAL PACKAGE
                    </span>
                    <span className="text-[10px] text-neutral-400">TABLET + PEN</span>
                  </div>

                  <div className="mt-1">
                    <span className="text-xl font-bold text-neutral-100">
                      ~$510
                    </span>
                    <span className="text-xs text-[var(--muted)] block">
                      (≈ ₹44,000)
                    </span>
                  </div>

                  <div className="mt-2 py-1 px-2 rounded bg-neutral-950/80 border border-neutral-800 text-[10px]">
                    <span className="text-neutral-400 block font-mono">Dev Co-Funding: ~$220 (≈ ₹19,000)</span>
                    <span className="text-neutral-300 font-sans font-medium block mt-0.5">+ Shipping, Taxes & Customs</span>
                  </div>

                  <div className="mt-3">
                    <span className="text-xs font-bold text-neutral-200 block">
                      Complete Bring-Up Setup
                    </span>
                    <span className="text-[11px] text-blue-400/90 block mt-0.5">
                      Hardware + Stylus Ecosystem
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] text-neutral-400 leading-relaxed font-sans">
                    Once the $290 (≈ ₹25,000) goal is reached, the developer immediately orders both the tablet and stylus to begin active development.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800/80">
                  <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>Orders placed immediately on completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
