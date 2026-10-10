import React from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CAMPAIGN_CONFIG } from "../config";
import { CampaignData, FundingSummary, DataStatus } from "../lib/types";
import { FundingProgress } from "./FundingProgress";
import { formatUsd, getFundingState } from "../lib/funding";

interface HeroProps {
  campaign: CampaignData;
  summary: FundingSummary;
  fxRate: number;
  dataStatus: DataStatus;
  onNavigateToDashboard: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  campaign,
  summary,
  fxRate,
  dataStatus,
  onNavigateToDashboard,
}) => {
  const funding = getFundingState(campaign, summary, fxRate);
  const developerShare = CAMPAIGN_CONFIG.DEV_COVERED_USD;
  return (
    <section className="site-container hero-layout">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="accent-dash" />
          Community-funded Android development
        </p>
        <h1>
          Xiaomi Pad 8
          <br />
          <span>development fund.</span>
        </h1>
        <p className="hero-description">
          Fund a dedicated Xiaomi Pad 8 for custom Android ROM development and
          hardware testing. The community covers part of the tablet cost.
        </p>
        <div className="developer-commitment">
          <p>
            The developer pays{" "}
            <strong>~{formatUsd(developerShare)} out of pocket.</strong>
          </p>
          <span>
            Covers the remaining tablet cost and the entire Focus Pen Pro. The
            developer also pays shipping and import costs.
          </span>
        </div>
        <div className="device-preview">
          <img
            src={CAMPAIGN_CONFIG.DEVICE_IMAGE_PATH}
            alt="Xiaomi Pad 8 development tablet"
            width="120"
            height="150"
          />
          <div>
            <span className="eyebrow">The development setup</span>
            <p className="mt-2 font-medium">Xiaomi Pad 8 + Focus Pen Pro</p>
            <p className="muted text-sm mt-1">
              Custom ROM, kernel, and stylus testing.
            </p>
          </div>
        </div>
      </div>
      <div className="funding-card">
        <FundingProgress
          campaign={campaign}
          summary={summary}
          fxRate={fxRate}
          dataStatus={dataStatus}
        />
        <a className="button button-primary w-full" href="#payment-methods">
          {dataStatus === "ready" && funding.acceptingPayments
            ? "View contribution methods"
            : "View payment information"}
          <ArrowRight size={17} />
        </a>
        <button
          className="text-link w-full justify-center mt-4"
          onClick={onNavigateToDashboard}
        >
          View verified contributions
          <ArrowUpRight size={15} />
        </button>
      </div>
    </section>
  );
};
