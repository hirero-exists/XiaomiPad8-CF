import React from "react";
import { ArrowLeft } from "lucide-react";
import {
  PublicDonation,
  FundingSummary,
  CampaignData,
  DataStatus,
} from "../lib/types";
import { isSupabaseConfigured } from "../lib/supabase";
import { FundingProgress } from "./FundingProgress";
import { RecentDonations } from "./RecentDonations";
import { formatUsd } from "../lib/funding";

interface DashboardViewProps {
  summary: FundingSummary;
  campaign: CampaignData;
  donations: PublicDonation[];
  fxRate: number;
  dataStatus: DataStatus;
  onNavigateToCampaign: () => void;
  onOpenVerificationModal: (method: "upi" | "international") => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  campaign,
  donations,
  fxRate,
  dataStatus,
  onNavigateToCampaign,
  onOpenVerificationModal,
}) => {
  const upiDonations = donations.filter((d) => d.payment_method === "upi");
  const internationalDonations = donations.filter(
    (d) => d.payment_method === "international",
  );
  return (
    <div className="site-container animate-fade-in">
      <div className="dashboard-header">
        <button className="text-link muted" onClick={onNavigateToCampaign}>
          <ArrowLeft size={14} />
          Back to campaign
        </button>
        <h1>Contribution history</h1>
        <p className="muted text-sm mt-4 leading-relaxed">
          Verified payments to the Xiaomi Pad 8 fund. Totals update after
          approval.
        </p>
      </div>
      <div className="dashboard-layout">
        {dataStatus === "ready" ? (
          <RecentDonations donations={donations} />
        ) : (
          <p className="empty-state" role="status">
            {dataStatus === "loading"
              ? "Loading verified contributions…"
              : "Contribution history is currently unavailable."}
          </p>
        )}
        <aside>
          <div className="funding-card">
            <FundingProgress
              campaign={campaign}
              summary={summary}
              fxRate={fxRate}
              dataStatus={dataStatus}
            />
            {dataStatus === "ready" && (
              <dl className="funding-facts">
                <div>
                  <dt>UPI · {upiDonations.length}</dt>
                  <dd>
                    {formatUsd(
                      upiDonations.reduce((sum, d) => sum + d.usd_amount, 0),
                    )}
                  </dd>
                </div>
                <div>
                  <dt>International · {internationalDonations.length}</dt>
                  <dd>
                    {formatUsd(
                      internationalDonations.reduce(
                        (sum, d) => sum + d.usd_amount,
                        0,
                      ),
                    )}
                  </dd>
                </div>
              </dl>
            )}
          </div>
          <div className="mt-7">
            <h2 className="text-sm font-medium">Already made a payment?</h2>
            <p className="muted text-xs leading-relaxed mt-2 mb-4">
              Submit your transaction reference for verification. Approved
              payments appear here.
            </p>
            <button
              className="button button-secondary w-full"
              onClick={() => onOpenVerificationModal("upi")}
              disabled={!isSupabaseConfigured || dataStatus !== "ready"}
            >
              Submit UPI payment
            </button>
            <button
              className="text-link w-full justify-center mt-3"
              onClick={() => onOpenVerificationModal("international")}
              disabled={!isSupabaseConfigured || dataStatus !== "ready"}
            >
              Submit international payment
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
