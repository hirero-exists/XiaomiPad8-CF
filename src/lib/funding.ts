import { CAMPAIGN_CONFIG } from "../config";
import { CampaignData, FundingSummary } from "./types";

export const formatUsd = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace(/\.00$/, "");

export const formatInr = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export function getFundingState(
  campaign: CampaignData,
  summary: FundingSummary,
  fxRate: number,
) {
  // The published project target is authoritative; preserve legacy database values.
  const goal = CAMPAIGN_CONFIG.COMMUNITY_GOAL_USD;
  const goalReached =
    summary.total_usd_raised >= goal ||
    campaign.campaign_status === "goal_reached";
  const acceptingPayments =
    campaign.fundraising_enabled &&
    campaign.campaign_status === "fundraising" &&
    !goalReached;
  const status =
    campaign.campaign_status === "refunds"
      ? "Refunds in progress"
      : campaign.campaign_status === "completed"
        ? "Campaign complete"
        : goalReached
          ? "Goal reached"
          : acceptingPayments
            ? "Fundraising open"
            : "Contributions paused";
  return {
    goal,
    goalInr: Math.round(goal * fxRate),
    goalReached,
    acceptingPayments,
    status,
    percentage: Math.min(
      100,
      Math.max(0, Math.round((summary.total_usd_raised / goal) * 100)),
    ),
    remaining: goalReached ? 0 : Math.max(0, goal - summary.total_usd_raised),
  };
}
