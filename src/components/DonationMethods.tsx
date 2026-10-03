import React, { useState } from 'react';
import { Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { CampaignData } from '../lib/types';
import { CAMPAIGN_CONFIG } from '../config';

interface DonationMethodsProps {
  campaign: CampaignData;
  onOpenVerificationModal: (method: 'upi' | 'international') => void;
  isGoalReached: boolean;
}

export const DonationMethods: React.FC<DonationMethodsProps> = ({
  campaign,
  onOpenVerificationModal,
  isGoalReached
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedTyvm, setCopiedTyvm] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const upiId = campaign.upi_id || CAMPAIGN_CONFIG.UPI_ID;
  const paymentUrl = campaign.payment_url || CAMPAIGN_CONFIG.INTERNATIONAL_PAYMENT_URL;
  const isFundraisingActive = campaign.fundraising_enabled && !isGoalReached;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyTyvm = () => {
    navigator.clipboard.writeText(paymentUrl);
    setCopiedTyvm(true);
    setTimeout(() => setCopiedTyvm(false), 2000);
  };

  return (
    <section id="payment-methods" className="border-b border-[var(--line)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="font-mono text-xs text-[var(--muted)] mb-2">
          05 // PAYMENT METHODS
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
          Choose any option.
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-2xl">
          Manual payment submissions are reviewed by the developer. All verified contributions appear on the public dashboard.
        </p>

        {/* Goal reached notice */}
        {!isFundraisingActive && (
          <div className="mt-6 p-4 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200">
            <span className="font-mono text-xs text-emerald-400 font-bold block mb-1">
              ● STATUS: GOAL COMPLETED
            </span>
            <p className="text-xs text-neutral-400 leading-relaxed">
              The community target of ${campaign.usd_goal || CAMPAIGN_CONFIG.COMMUNITY_GOAL_USD} has been fully funded. Contributions are currently closed. The developer will cover the rest personally.
            </p>
            {campaign.purchase_status !== 'pending' && (
              <div className="mt-2.5 pt-2.5 border-t border-neutral-800 text-xs font-mono text-neutral-400 flex items-center gap-3">
                <span>Hardware: <strong className="text-neutral-200 capitalize">{campaign.purchase_status}</strong></span>
                {campaign.purchase_proof_url && (
                  <a
                    href={campaign.purchase_proof_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-400 hover:text-blue-300"
                  >
                    Receipt / Proof ↗
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ========================================================= */}
          {/* OPTION 1: UPI (India)                                     */}
          {/* ========================================================= */}
          <div className="p-5 sm:p-6 rounded-lg bg-neutral-900/60 border border-[var(--line)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between font-mono text-xs mb-3">
                <span className="text-blue-400 font-bold">upi // india</span>
                <span className="text-[var(--muted)]">0% fees</span>
              </div>

              <h3 className="text-base font-bold text-neutral-100 mb-1">
                UPI Direct Transfer
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                Send via any UPI app (GPay / PhonePe / Paytm / BHIM) to the VPA address below. Add reference: <code className="text-neutral-200">PAD8</code>.
              </p>

              {/* Code block with copy */}
              <div className="relative mb-3">
                <pre className="p-3 rounded bg-neutral-950 border border-[var(--line)] font-mono text-xs text-neutral-200 overflow-x-auto select-all">
                  {upiId}
                </pre>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="absolute right-2 top-2 p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors text-xs font-mono flex items-center gap-1"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)] mb-4">
                <span>holder: {CAMPAIGN_CONFIG.UPI_NAME}</span>
                <button
                  type="button"
                  onClick={() => setShowQr(!showQr)}
                  className="inline-flex items-center gap-1 text-neutral-400 hover:text-neutral-200 underline"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{showQr ? 'Hide QR' : 'Show QR'}</span>
                </button>
              </div>

              {showQr && (
                <div className="mb-4 p-4 bg-neutral-950 rounded border border-[var(--line)] text-center">
                  <div className="bg-white p-3 rounded inline-block mx-auto mb-2 shadow-sm">
                    <img
                      src={CAMPAIGN_CONFIG.UPI_QR_IMAGE}
                      alt="UPI QR Code for hirero@slc"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  <p className="text-[11px] font-mono text-[var(--muted)]">Scan with GPay, PhonePe, Paytm, or BHIM</p>
                  <a
                    href={`upi://pay?pa=${upiId}&pn=Hirero&cu=INR&tn=PAD8`}
                    className="inline-block mt-2 text-xs font-mono text-blue-400 hover:text-blue-300 underline sm:hidden"
                  >
                    Tap to open UPI app directly
                  </a>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--line)]">
              <button
                type="button"
                disabled={!isFundraisingActive}
                onClick={() => onOpenVerificationModal('upi')}
                className={`w-full py-2.5 px-4 rounded font-mono text-xs font-medium transition-colors text-center ${
                  isFundraisingActive
                    ? 'bg-neutral-100 text-neutral-950 font-semibold hover:bg-white'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                I've donated via UPI →
              </button>
              <span className="text-[11px] font-mono text-[var(--muted)] block text-center mt-1.5">
                Submit transaction reference for dashboard verification
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* OPTION 2: INTERNATIONAL / CARD (ThankYouVeryMuch)          */}
          {/* ========================================================= */}
          <div className="p-5 sm:p-6 rounded-lg bg-neutral-900/60 border border-[var(--line)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between font-mono text-xs mb-3">
                <span className="text-blue-400 font-bold">hosted // card</span>
                <span className="text-[var(--muted)]">ThankYouVeryMuch</span>
              </div>

              <h3 className="text-base font-bold text-neutral-100 mb-1">
                International Card Payment
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed mb-4">
                Card, Apple Pay, Google Pay, or international payment methods via ThankYouVeryMuch checkout.
              </p>

              {/* Code block with copy */}
              <div className="relative mb-3">
                <pre className="p-3 rounded bg-neutral-950 border border-[var(--line)] font-mono text-xs text-neutral-200 overflow-x-auto select-all">
                  {paymentUrl}
                </pre>
                <button
                  type="button"
                  onClick={handleCopyTyvm}
                  className="absolute right-2 top-2 p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors text-xs font-mono flex items-center gap-1"
                  title="Copy Link"
                >
                  {copiedTyvm ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTyvm ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="mb-4">
                <a
                  href={isFundraisingActive ? paymentUrl : '#'}
                  target={isFundraisingActive ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!isFundraisingActive) e.preventDefault();
                  }}
                  className={`w-full py-2.5 px-4 rounded font-mono text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border ${
                    isFundraisingActive
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border-neutral-700'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
                  }`}
                >
                  <span>Donate on ThankYouVeryMuch</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                </a>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--line)]">
              <button
                type="button"
                disabled={!isFundraisingActive}
                onClick={() => onOpenVerificationModal('international')}
                className={`w-full py-2.5 px-4 rounded font-mono text-xs font-medium transition-colors text-center border ${
                  isFundraisingActive
                    ? 'border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-600 cursor-not-allowed'
                }`}
              >
                Submit payment for verification →
              </button>
              <span className="text-[11px] font-mono text-[var(--muted)] block text-center mt-1.5">
                Already paid on TYVM? Submit reference for public tracker
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
