import React, { useState } from 'react';
import { PublicDonation, FundingSummary, CampaignData } from '../lib/types';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { CAMPAIGN_CONFIG } from '../config';

interface DashboardViewProps {
  summary: FundingSummary;
  campaign: CampaignData;
  donations: PublicDonation[];
  fxRate: number;
  onNavigateToCampaign: () => void;
  onOpenVerificationModal: (method: 'upi' | 'international') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  campaign,
  donations,
  fxRate,
  onNavigateToCampaign,
  onOpenVerificationModal
}) => {
  const [displayCount, setDisplayCount] = useState(15);

  const communityGoalUsd = CAMPAIGN_CONFIG.COMMUNITY_GOAL_USD;
  const communityGoalInr = CAMPAIGN_CONFIG.COMMUNITY_GOAL_INR;

  const usdRaised = summary.total_usd_raised;
  const inrRaised = summary.total_inr_raised;

  const isGoalReached = usdRaised >= communityGoalUsd || campaign.campaign_status === 'goal_reached';

  const remainingUsd = Math.max(0, Math.round((communityGoalUsd - usdRaised) * 100) / 100);
  const remainingInr = Math.max(0, communityGoalInr - inrRaised);

  const upiDonations = donations.filter(d => d.payment_method === 'upi');
  const intlDonations = donations.filter(d => d.payment_method === 'international');

  const upiTotalUsd = Math.round(upiDonations.reduce((sum, d) => sum + d.usd_amount, 0) * 100) / 100;
  const intlTotalUsd = Math.round(intlDonations.reduce((sum, d) => sum + d.usd_amount, 0) * 100) / 100;

  const visibleDonations = donations.slice(0, displayCount);
  const hasMore = donations.length > displayCount;

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const getInitials = (name: string) => {
    const clean = name.trim();
    if (!clean || clean.toLowerCase() === 'anonymous') return 'AN';
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  return (
    <div className="animate-fade-in pb-16">
      {/* Top Banner Header */}
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="absolute inset-0 grid-bg opacity-70 pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16">
          <button
            onClick={onNavigateToCampaign}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--muted)] hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>back to campaign</span>
          </button>

          <div className="font-mono text-xs text-[var(--muted)] mb-2 flex items-center justify-between">
            <span>● PUBLIC DASHBOARD</span>
            <span className="text-neutral-500 text-[11px]">1 USD ≈ ₹{fxRate.toFixed(2)}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-100">
            Live totals — updated on approval.
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] max-w-xl">
            Realtime public audit of all verified community contributions for the Xiaomi Pad 8 hardware fund.
          </p>

          {/* 4-column metric strip */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 border-y border-[var(--line)]">
            <div className="border-r border-[var(--line)] px-3 sm:px-5 py-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] block">raised</span>
              <div className="font-mono mt-1">
                <span className="text-xl sm:text-3xl font-bold text-neutral-100">${usdRaised}</span>
                <span className="text-[11px] text-[var(--muted)] block mt-0.5">(≈ ₹{inrRaised.toLocaleString('en-IN')})</span>
              </div>
            </div>

            <div className="sm:border-r border-[var(--line)] px-3 sm:px-5 py-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-blue-400 block">community goal</span>
              <div className="font-mono mt-1">
                <span className="text-xl sm:text-3xl font-bold text-neutral-100">${communityGoalUsd}</span>
                <span className="text-[11px] text-[var(--muted)] block mt-0.5">(≈ ₹{communityGoalInr.toLocaleString('en-IN')})</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono block mt-1">Dev covers ~$220 remaining</span>
            </div>

            <div className="border-t sm:border-t-0 border-r border-[var(--line)] px-3 sm:px-5 py-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] block">donations</span>
              <div className="font-mono mt-1">
                <span className="text-xl sm:text-3xl font-bold text-neutral-100">{summary.verified_count}</span>
                <span className="text-[11px] text-[var(--muted)] block mt-0.5">verified</span>
              </div>
            </div>

            <div className="border-t sm:border-t-0 px-3 sm:px-5 py-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] block">remaining</span>
              <div className="font-mono mt-1">
                <span className="text-xl sm:text-3xl font-bold text-neutral-100">
                  {isGoalReached ? '$0' : `$${remainingUsd}`}
                </span>
                <span className="text-[11px] text-[var(--muted)] block mt-0.5">
                  {isGoalReached
                    ? 'goal met 🎉 dev covers rest'
                    : `(≈ ₹${remainingInr.toLocaleString('en-IN')} to goal)`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Recent Approved Supporters */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-mono text-xs text-[var(--muted)] block">
                  Recent approved supporters
                </span>
                <h2 className="text-lg font-bold text-neutral-100">
                  Verified contributions
                </h2>
              </div>

              <span className="font-mono text-xs text-[var(--muted)]">
                {donations.length} total
              </span>
            </div>

            {donations.length === 0 ? (
              <div className="p-8 text-center rounded-lg bg-neutral-900/30 border border-[var(--line)] text-[var(--muted)] text-xs font-mono">
                No approved contributions yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {visibleDonations.map((item) => {
                  const isUpi = item.payment_method === 'upi';
                  const initials = getInitials(item.display_name);

                  // USD main, bracketed native/INR
                  const usdDisplay = `$${item.usd_amount}`;
                  const bracketDisplay =
                    item.native_currency === 'INR'
                      ? `(₹${item.native_amount.toLocaleString('en-IN')})`
                      : item.inr_amount > 0
                      ? `(≈ ₹${item.inr_amount.toLocaleString('en-IN')})`
                      : `(${item.native_currency} ${item.native_amount})`;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-lg bg-neutral-900/50 hover:bg-neutral-900/80 border border-[var(--line)] transition-colors flex items-start gap-3"
                    >
                      {/* Avatar with 2-letter uppercase initials */}
                      <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-mono text-xs font-bold text-neutral-300 shrink-0 mt-0.5">
                        {initials}
                      </div>

                      {/* Donor info & message */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-100 truncate">
                              {item.display_name}
                            </span>
                            <span className="text-[11px] font-mono text-[var(--muted)]">
                              {isUpi ? 'UPI (India)' : 'Card (TYVM)'} · {formatDate(item.approved_at || item.created_at)}
                            </span>
                          </div>

                          {/* Amount: USD primary, bracketed INR */}
                          <div className="font-mono text-right shrink-0">
                            <span className="text-xs font-bold text-neutral-100">{usdDisplay}</span>{' '}
                            <span className="text-[11px] text-[var(--muted)]">{bracketDisplay}</span>
                          </div>
                        </div>

                        {item.message && (
                          <p className="mt-1 text-xs text-neutral-400 italic">
                            "{item.message}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {hasMore && (
                  <div className="pt-3 text-center">
                    <button
                      type="button"
                      onClick={() => setDisplayCount((prev) => prev + 15)}
                      className="px-4 py-2 rounded font-mono text-xs text-neutral-400 hover:text-white border border-[var(--line)] bg-neutral-900 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Show more ({donations.length - displayCount} remaining)</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Column: Breakdown by Category & Verification Trigger */}
          <div className="space-y-6">
            <div className="p-5 rounded-lg bg-neutral-900/60 border border-[var(--line)]">
              <span className="font-mono text-xs text-[var(--muted)] block mb-1">
                Breakdown
              </span>
              <h3 className="text-base font-bold text-neutral-100 mb-4">
                By category
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                  <span className="text-neutral-300">UPI (India)</span>
                  <div className="text-right">
                    <span className="text-neutral-100 font-bold">${upiTotalUsd}</span>{' '}
                    <span className="text-[var(--muted)]">({upiDonations.length})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                  <span className="text-neutral-300">International / TYVM</span>
                  <div className="text-right">
                    <span className="text-neutral-100 font-bold">${intlTotalUsd}</span>{' '}
                    <span className="text-[var(--muted)]">({intlDonations.length})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[var(--muted)] text-[11px]">
                  <span>Total verified:</span>
                  <span className="text-neutral-200 font-bold">${usdRaised} USD</span>
                </div>
              </div>
            </div>

            {/* Quick Submit Verification Button in Dashboard */}
            <div className="p-5 rounded-lg bg-neutral-900/60 border border-[var(--line)]">
              <h4 className="text-sm font-bold text-neutral-100 mb-1">
                Already made a payment?
              </h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                If you transferred via UPI or ThankYouVeryMuch, submit your reference ID so it can be reviewed and added to this dashboard.
              </p>

              <div className="space-y-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => onOpenVerificationModal('upi')}
                  className="w-full py-2 px-3 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-center transition-colors block"
                >
                  Verify UPI payment →
                </button>
                <button
                  type="button"
                  onClick={() => onOpenVerificationModal('international')}
                  className="w-full py-2 px-3 rounded border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-center transition-colors block"
                >
                  Verify TYVM card payment →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
