import React, { useEffect, useState } from "react";
import { Copy, Check, ArrowUpRight, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { CampaignData, DataStatus } from "../lib/types";
import { CAMPAIGN_CONFIG } from "../config";
import { getFundingState } from "../lib/funding";
import { isDesignPreview, isSupabaseConfigured } from "../lib/supabase";

interface DonationMethodsProps {
  campaign: CampaignData;
  onOpenVerificationModal: (method: "upi" | "international") => void;
  isGoalReached: boolean;
  dataStatus: DataStatus;
}

export const DonationMethods: React.FC<DonationMethodsProps> = ({
  campaign,
  onOpenVerificationModal,
  isGoalReached,
  dataStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrImage, setQrImage] = useState("");
  const savedUpiId = campaign.upi_id?.trim();
  const upiId =
    savedUpiId && savedUpiId !== "developer@upi"
      ? savedUpiId
      : CAMPAIGN_CONFIG.UPI_ID;
  const paymentUrl =
    campaign.payment_url || CAMPAIGN_CONFIG.INTERNATIONAL_PAYMENT_URL;
  const upiUrl = `upi://pay?${new URLSearchParams({ pa: upiId, pn: CAMPAIGN_CONFIG.UPI_NAME, cu: "INR", tn: "PAD8" })}`;
  const funding = getFundingState(
    campaign,
    { total_usd_raised: 0, total_inr_raised: 0, verified_count: 0 },
    1,
  );
  const servicesAvailable = isSupabaseConfigured && dataStatus === "ready";
  const acceptingPayments =
    servicesAvailable && funding.acceptingPayments && !isGoalReached;

  useEffect(() => {
    if (!acceptingPayments) return;
    let active = true;
    QRCode.toDataURL(upiUrl, { width: 240, margin: 2 })
      .then((image) => {
        if (active) setQrImage(image);
      })
      .catch(() => {
        if (active) setQrImage("");
      });
    return () => {
      active = false;
    };
  }, [upiUrl, acceptingPayments]);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <section
      id="payment-methods"
      className="site-container section-spacing section-divider"
    >
      <div className="section-heading">
        <p className="eyebrow">Contributions</p>
        <h2>
          {acceptingPayments
            ? "Payment and verification"
            : servicesAvailable
              ? "Contributions are currently closed"
              : "Payment information"}
        </h2>
        <p className="muted">
          {acceptingPayments
            ? "Send your payment, then submit its transaction reference for review."
            : servicesAvailable
              ? "Existing payments can still be submitted for verification."
              : isDesignPreview
                ? "Payments and submissions are disabled in the design preview."
                : "Payment services are currently unavailable."}
        </p>
      </div>
      {servicesAvailable && !acceptingPayments && (
        <div className="campaign-notice">
          <p className="font-medium">
            {isGoalReached
              ? "The community goal has been reached. Thank you."
              : funding.status + "."}
          </p>
          <p className="muted mt-2">
            {campaign.campaign_status === "refunds"
              ? "See the refund terms below for how payments are returned."
              : "New payments are paused. Verified contributions remain on the public list."}
          </p>
        </div>
      )}
      <div className="payment-grid">
        <div className="payment-card">
          <span className="eyebrow">India</span>
          <h3>UPI transfer</h3>
          <p className="payment-description">
            Pay with GPay, PhonePe, Paytm, BHIM, or another UPI app.
          </p>
          {acceptingPayments && (
            <>
              <p className="payment-step mt-6">1. Send your payment</p>
              <div className="payment-id mt-0">
                <code>{upiId}</code>
                <button
                  className="copy-button"
                  onClick={copyUpi}
                  aria-label="Copy UPI ID"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p aria-live="polite" className="payment-note">
                {copyError
                  ? "Copy unavailable. Select the UPI ID above and copy it manually."
                  : `Account: ${CAMPAIGN_CONFIG.UPI_NAME} · Payment note: PAD8`}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
                <button
                  className="text-link"
                  onClick={() => setShowQr(!showQr)}
                  aria-expanded={showQr}
                  aria-controls="upi-qr"
                >
                  <QrCode size={14} />
                  {showQr ? "Hide QR code" : "Show QR code"}
                </button>
                <a className="text-link" href={upiUrl}>
                  Open UPI app
                  <ArrowUpRight size={14} />
                </a>
              </div>
              {showQr && (
                <div id="upi-qr" className="qr-panel">
                  {qrImage ? (
                    <img
                      src={qrImage}
                      alt={`UPI payment QR code for ${upiId}`}
                      width="190"
                      height="190"
                    />
                  ) : (
                    <p className="payment-description">
                      Use the UPI ID above to make your payment.
                    </p>
                  )}
                  <p className="payment-note">Scan with your UPI app</p>
                </div>
              )}
            </>
          )}
          <div className="payment-actions">
            <p className="payment-step">
              {acceptingPayments
                ? "2. Submit your payment reference"
                : "Payment verification"}
            </p>
            <button
              className="button button-secondary"
              onClick={() => onOpenVerificationModal("upi")}
              disabled={!servicesAvailable}
            >
              Submit UPI payment
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
        <div className="payment-card">
          <span className="eyebrow">International</span>
          <h3>Card & online payments</h3>
          <p className="payment-description">
            Pay through the ThankYouVeryMuch checkout using its available
            payment methods.
          </p>
          {acceptingPayments && (
            <>
              <p className="payment-step mt-6">1. Open the secure checkout</p>
              <a
                className="button button-primary"
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay on ThankYouVeryMuch
                <ArrowUpRight size={15} />
              </a>
              <p className="payment-note">
                Opens in a new tab. Save your transaction reference before
                coming back here.
              </p>
            </>
          )}
          <div className="payment-actions">
            <p className="payment-step">
              {acceptingPayments
                ? "2. Submit your payment reference"
                : "Payment verification"}
            </p>
            <button
              className="button button-secondary"
              onClick={() => onOpenVerificationModal("international")}
              disabled={!servicesAvailable}
            >
              Submit international payment
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </div>
      <p className="payment-note mt-5">
        Payments are checked manually. Your contribution appears in the public
        total after approval.
      </p>
    </section>
  );
};
