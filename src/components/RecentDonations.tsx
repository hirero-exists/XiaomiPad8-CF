import React, { useState } from 'react';
import { PublicDonation } from '../lib/types';

interface RecentDonationsProps {
  donations: PublicDonation[];
}

export const RecentDonations: React.FC<RecentDonationsProps> = ({ donations }) => {
  const [displayCount, setDisplayCount] = useState(6);

  const visibleDonations = donations.slice(0, displayCount);
  const hasMore = donations.length > displayCount;

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <section className="py-6 sm:py-8 border-b border-neutral-800/80">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
            <span>Recent verified contributions</span>
            <span className="text-xs font-mono text-neutral-500">
              ({donations.length})
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Confirmed community backers
          </p>
        </div>
      </div>

      {donations.length === 0 ? (
        <div className="p-6 text-center rounded-lg bg-neutral-900/30 border border-neutral-800 text-neutral-500 text-xs font-mono">
          No verified contributions yet.
        </div>
      ) : (
        <div className="space-y-2">
          {visibleDonations.map((item) => {
            const isUpi = item.payment_method === 'upi';

            // USD is main everywhere; bracketed native/INR
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
                className="bg-neutral-900/40 hover:bg-neutral-900/70 border border-neutral-800/80 rounded-lg p-3 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4"
              >
                {/* Left: Name, method, message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-200 truncate">
                      {item.display_name}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-neutral-500">
                      via {isUpi ? 'UPI' : 'Card'}
                    </span>
                    {item.approved_at && (
                      <span className="text-[10px] font-mono text-neutral-600 hidden sm:inline">
                        • {formatDate(item.approved_at)}
                      </span>
                    )}
                  </div>

                  {item.message && (
                    <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                      "{item.message}"
                    </p>
                  )}
                </div>

                {/* Right: USD primary with bracketed native amount */}
                <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center font-mono">
                  <span className="text-xs sm:text-sm font-semibold text-neutral-100">
                    {usdDisplay}
                  </span>
                  <span className="text-[11px] text-neutral-500 sm:ml-1">
                    {bracketDisplay}
                  </span>
                </div>
              </div>
            );
          })}

          {hasMore && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setDisplayCount((prev) => prev + 6)}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
              >
                Show more ({donations.length - displayCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
