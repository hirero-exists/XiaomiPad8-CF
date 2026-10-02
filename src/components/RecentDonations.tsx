import React, { useState } from 'react';
import { ShieldCheck, MessageSquare, ChevronDown } from 'lucide-react';
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
    <section className="py-10 border-b border-zinc-800/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Recent verified contributions</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              {donations.length}
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Confirmed community backers supporting hardware procurement.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Manual Admin Verification</span>
        </div>
      </div>

      {donations.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800 text-zinc-500 text-xs">
          No verified contributions yet. Be the first to support the project above!
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleDonations.map((item) => {
            const isUpi = item.payment_method === 'upi';
            const nativeSymbol = item.native_currency === 'INR' ? '₹' : item.native_currency === 'USD' ? '$' : item.native_currency + ' ';

            return (
              <div
                key={item.id}
                className="bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-3.5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left: Donor Name, Badge, Date */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-xs font-semibold text-zinc-300">
                    {item.display_name.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-200">
                        {item.display_name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-medium ${
                          isUpi
                            ? 'bg-blue-950/40 text-blue-400 border border-blue-500/20'
                            : 'bg-purple-950/40 text-purple-400 border border-purple-500/20'
                        }`}
                      >
                        {isUpi ? 'UPI' : 'International'}
                      </span>
                    </div>

                    {item.message && (
                      <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1 italic">
                        <MessageSquare className="w-3 h-3 text-zinc-500 shrink-0" />
                        <span>"{item.message}"</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Amount & locked conversion */}
                <div className="text-right sm:shrink-0 flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800/50">
                  <div className="text-sm font-bold font-mono text-white">
                    {nativeSymbol}{item.native_amount.toLocaleString()}
                  </div>

                  <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-2">
                    {item.native_currency === 'INR' && item.usd_amount > 0 && (
                      <span>(~${item.usd_amount})</span>
                    )}
                    {item.native_currency !== 'INR' && item.inr_amount > 0 && (
                      <span>(~₹{item.inr_amount.toLocaleString()})</span>
                    )}
                    {item.approved_at && (
                      <span className="text-zinc-600">• {formatDate(item.approved_at)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Show More Button */}
          {hasMore && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setDisplayCount((prev) => prev + 6)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <span>Show more contributions ({donations.length - displayCount} remaining)</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
