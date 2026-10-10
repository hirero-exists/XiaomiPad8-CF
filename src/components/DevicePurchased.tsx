import React from "react";
import { ArrowUpRight } from "lucide-react";
import { CampaignData } from "../lib/types";
import { CAMPAIGN_CONFIG } from "../config";
import { formatUsd, formatInr } from "../lib/funding";

interface DevicePurchasedProps {
  campaign: CampaignData;
}

export const DevicePurchased: React.FC<DevicePurchasedProps> = ({
  campaign,
}) => {
  const goal = CAMPAIGN_CONFIG.COMMUNITY_GOAL_USD;
  const developerShare = CAMPAIGN_CONFIG.DEV_COVERED_USD;
  const status =
    campaign.purchase_status === "received"
      ? "Hardware received"
      : campaign.purchase_status === "ordered"
        ? "Hardware ordered"
        : "Purchase after the goal is reached";
  return (
    <section className="site-container section-spacing section-divider budget-layout">
      <div className="section-heading">
        <p className="eyebrow">Where the money goes</p>
        <h2>Hardware budget</h2>
        <p className="muted">
          Contributions fund part of the tablet. The developer pays the
          remaining balance, the entire pen cost, shipping, taxes, and customs.
        </p>
        <p className="budget-status">{status}</p>
        {campaign.purchase_proof_url && (
          <a
            className="text-link mt-3"
            href={campaign.purchase_proof_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View purchase receipt
            <ArrowUpRight size={15} />
          </a>
        )}
        {campaign.purchase_notes && (
          <p className="muted text-sm mt-3 break-words">
            {campaign.purchase_notes}
          </p>
        )}
      </div>
      <div className="budget-breakdown">
        <dl>
          <div>
            <dt>
              {CAMPAIGN_CONFIG.TABLET_NAME}
              <span>Base tablet</span>
            </dt>
            <dd>
              ≈ {formatUsd(CAMPAIGN_CONFIG.TABLET_PRICE_USD)}
              <span>≈ {formatInr(CAMPAIGN_CONFIG.TABLET_PRICE_INR)}</span>
            </dd>
          </div>
          <div>
            <dt>
              {CAMPAIGN_CONFIG.PEN_NAME}
              <span>Funded by the developer</span>
            </dt>
            <dd>
              ≈ {formatUsd(CAMPAIGN_CONFIG.PEN_PRICE_USD)}
              <span>≈ {formatInr(CAMPAIGN_CONFIG.PEN_PRICE_INR)}</span>
            </dd>
          </div>
          <div className="budget-total">
            <dt>Estimated hardware cost</dt>
            <dd>≈ {formatUsd(CAMPAIGN_CONFIG.TOTAL_PACKAGE_USD)}</dd>
          </div>
        </dl>
        <div className="cost-split">
          <div>
            <span className="muted text-sm">Community share</span>
            <strong>{formatUsd(goal)}</strong>
          </div>
          <div>
            <span className="muted text-sm">Developer share</span>
            <strong>≈ {formatUsd(developerShare)}</strong>
          </div>
        </div>
        <p className="muted text-xs mt-4 leading-relaxed">
          Hardware prices are estimates. The developer covers shipping and
          import costs in addition to the hardware balance.
        </p>
      </div>
    </section>
  );
};
