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
  const [showQr, setShowQr] = useState(false);

  const upiId = campaign.upi_id || CAMPAIGN_CONFIG.UPI_ID;
  const paymentUrl = campaign.payment_url || CAMPAIGN_CONFIG.INTERNATIONAL_PAYMENT_URL;
  const isFundraisingActive = campaign.fundraising_enabled && !isGoalReached;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <section id="donate" className="py-6 sm:py-8 border-b border-neutral-800/80">
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-100">
          Support the project
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
          Contributions are verified manually by the admin before appearing on the public tracker.
        </p>
      </div>

      {/* Goal Reached notice */}
      {!isFundraisingActive && (
        <div className="mb-5 p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-200">
          <div className="font-semibold text-sm mb-1 text-emerald-400">
            Community goal reached 🎉
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            The target of $350 has been fully funded. Contributions are currently closed. The remaining balance will be covered personally by the developer. Thank you to everyone who contributed!
          </p>
          {campaign.purchase_status !== 'pending' && (
            <div className="mt-2.5 pt-2.5 border-t border-neutral-800 text-xs font-mono text-neutral-400 flex items-center gap-3">
              <span>Status: <strong className="text-neutral-200 capitalize">{campaign.purchase_status}</strong></span>
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

      {/* Two payment cards: Mobile-first stacked, 2 cols on md */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ========================================================= */}
        {/* INDIA - UPI                                               */}
        {/* ========================================================= */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
                India (UPI)
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                0% fees
              </span>
            </div>

            <h3 className="text-base font-semibold text-neutral-100">
              UPI Direct Transfer
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Transfer via GPay, PhonePe, Paytm, or any BHIM UPI app.
            </p>

            {/* UPI ID box */}
            <div className="mt-4 p-2.5 bg-neutral-950 rounded-lg border border-neutral-800 flex items-center justify-between gap-2">
              <div className="overflow-hidden">
                <span className="text-[10px] font-mono uppercase text-neutral-500 block">UPI ID</span>
                <span className="text-xs sm:text-sm font-mono text-neutral-200 select-all truncate block">
                  {upiId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="shrink-0 px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors text-xs font-mono flex items-center gap-1"
                title="Copy UPI ID"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* QR Toggle button */}
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{showQr ? 'Hide QR Code' : 'Show UPI QR'}</span>
              </button>

              {showQr && (
                <div className="mt-3 p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-center">
                  <div className="bg-white p-2 rounded inline-block mx-auto mb-2">
                    <img
                      src={CAMPAIGN_CONFIG.UPI_QR_IMAGE}
                      alt="UPI QR Code"
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                  <p className="text-[11px] font-mono text-neutral-400">Scan using any UPI app</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-neutral-800/80">
            <button
              type="button"
              disabled={!isFundraisingActive}
              onClick={() => onOpenVerificationModal('upi')}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-medium font-mono transition-colors text-center ${
                isFundraisingActive
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              I've donated via UPI
            </button>
            <span className="text-[11px] text-neutral-500 block text-center mt-1.5">
              Submit your UTR number for verification
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* INTERNATIONAL - CARD PAYMENT                              */}
        {/* ========================================================= */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                International
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                Card / Gateway
              </span>
            </div>

            <h3 className="text-base font-semibold text-neutral-100">
              International Payment
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Credit/debit card or international digital wallets via external payment link.
            </p>

            <div className="mt-4">
              <a
                href={isFundraisingActive ? paymentUrl : '#'}
                target={isFundraisingActive ? '_blank' : '_self'}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!isFundraisingActive) e.preventDefault();
                }}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-medium font-mono transition-colors flex items-center justify-center gap-1.5 border ${
                  isFundraisingActive
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border-neutral-700'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
                }`}
              >
                <span>Donate by card</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
              </a>
              <span className="text-[11px] text-neutral-500 block mt-1.5 text-center">
                Opens external checkout page
              </span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-neutral-800/80">
            <button
              type="button"
              disabled={!isFundraisingActive}
              onClick={() => onOpenVerificationModal('international')}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-medium font-mono transition-colors text-center border ${
                isFundraisingActive
                  ? 'border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-600 cursor-not-allowed'
              }`}
            >
              Submit payment for verification
            </button>
            <span className="text-[11px] text-neutral-500 block text-center mt-1.5">
              Already donated? Submit reference for public tracker
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
