import React, { useState } from "react";
import { PublicDonation } from "../lib/types";
import { formatUsd, formatInr } from "../lib/funding";

interface RecentDonationsProps {
  donations: PublicDonation[];
}

export const RecentDonations: React.FC<RecentDonationsProps> = ({
  donations,
}) => {
  const [displayCount, setDisplayCount] = useState(15);
  return (
    <section aria-labelledby="contribution-list-title">
      <div className="flex items-center justify-between gap-4 mb-2">
        <h2
          id="contribution-list-title"
          className="text-xl font-medium tracking-tight"
        >
          Verified contributions
        </h2>
        <span className="muted text-xs">{donations.length} total</span>
      </div>
      {donations.length === 0 ? (
        <p className="empty-state">
          No verified contributions yet. Payments appear here once they’ve been
          reviewed.
        </p>
      ) : (
        donations.slice(0, displayCount).map((item) => (
          <article key={item.id} className="donation-row">
            <div className="min-w-0">
              <h3 className="donation-name">{item.display_name}</h3>
              <p className="muted text-xs mt-1.5">
                {item.payment_method === "upi" ? "UPI" : "International"} ·{" "}
                {new Date(
                  item.approved_at || item.created_at,
                ).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              {item.message && (
                <p className="donation-message">{item.message}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="donation-amount">{formatUsd(item.usd_amount)}</p>
              <p className="muted text-xs mt-1.5">
                {item.native_currency === "INR"
                  ? formatInr(item.native_amount)
                  : `≈ ${formatInr(item.inr_amount)}`}
              </p>
            </div>
          </article>
        ))
      )}
      {donations.length > displayCount && (
        <button
          className="button button-secondary mt-6"
          onClick={() => setDisplayCount((count) => count + 15)}
        >
          Show more ({donations.length - displayCount} remaining)
        </button>
      )}
    </section>
  );
};
