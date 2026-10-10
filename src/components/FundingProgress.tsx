import React from "react";
import { FundingSummary, CampaignData, DataStatus } from "../lib/types";
import { formatUsd, formatInr, getFundingState } from "../lib/funding";

interface FundingProgressProps {
  summary: FundingSummary;
  campaign: CampaignData;
  fxRate: number;
  dataStatus: DataStatus;
}

export const FundingProgress: React.FC<FundingProgressProps> = ({
  summary,
  campaign,
  fxRate,
  dataStatus,
}) => {
  if (dataStatus !== "ready") {
    return (
      <div className="funding-progress" role="status">
        <p className="eyebrow mb-6">Community progress</p>
        <p className="text-xl font-medium">
          {dataStatus === "loading"
            ? "Loading contributions…"
            : "Progress unavailable"}
        </p>
        <p className="muted text-sm mt-3 mb-8">
          {dataStatus === "loading"
            ? "Retrieving verified payments."
            : "Verified totals will appear when campaign data is available."}
        </p>
      </div>
    );
  }
  const funding = getFundingState(campaign, summary, fxRate);
  return (
    <div className="funding-progress">
      <div className="flex items-center justify-between gap-3 mb-6">
        <span className="eyebrow">Community progress</span>
        <span
          className={`status-label ${funding.goalReached ? "status-complete" : ""}`}
        >
          <span aria-hidden="true" />
          {funding.status}
        </span>
      </div>
      <div className="funding-amount">
        {formatUsd(summary.total_usd_raised)}
        <span>raised</span>
      </div>
      <p className="muted text-sm mt-2">
        ≈ {formatInr(summary.total_inr_raised)} in verified contributions
      </p>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Community funding"
        aria-valuenow={funding.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div style={{ width: `${funding.percentage}%` }} />
      </div>
      <div className="flex justify-between gap-3 text-sm">
        <span>
          <strong>{funding.percentage}%</strong> funded
        </span>
        <span className="muted">of {formatUsd(funding.goal)}</span>
      </div>
      <dl className="funding-facts">
        <div>
          <dt>Still needed</dt>
          <dd>{formatUsd(funding.remaining)}</dd>
        </div>
        <div>
          <dt>Verified contributions</dt>
          <dd>{summary.verified_count}</dd>
        </div>
      </dl>
      <p className="funding-note">
        Goal: {formatUsd(funding.goal)} (≈ {formatInr(funding.goalInr)} at the
        current rate). Only approved payments count.
      </p>
    </div>
  );
};
