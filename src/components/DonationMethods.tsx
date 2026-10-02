import React, { useState } from 'react';
import { QrCode, Copy, Check, ExternalLink, Globe, IndianRupee, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
  const [showQrModal, setShowQrModal] = useState(false);

  const upiId = campaign.upi_id || CAMPAIGN_CONFIG.UPI_ID;
  const paymentUrl = campaign.payment_url || CAMPAIGN_CONFIG.INTERNATIONAL_PAYMENT_URL;
  const isFundraisingActive = campaign.fundraising_enabled && !isGoalReached;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <section id="donate" className="py-10 border-b border-zinc-800/60">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Support the project
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Choose your preferred method. All contributions are manually verified before appearing on the public tracker.
        </p>
      </div>

      {/* Goal Reached State Banner */}
      {!isFundraisingActive && (
        <div className="mb-6 p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200">
          <div className="flex items-center gap-2.5 font-semibold text-base mb-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Community goal reached! 🎉</span>
          </div>
          <p className="text-sm text-emerald-300/90 leading-relaxed">
            The target of $350 has been fully funded by the community. New contributions are currently paused. The remaining device cost will be covered personally by the developer. Thank you to everyone who supported!
          </p>
          {campaign.purchase_status !== 'pending' && (
            <div className="mt-3 pt-3 border-t border-emerald-500/20 text-xs flex flex-wrap items-center gap-4">
              <span>
                <strong>Purchase Status:</strong>{' '}
                <span className="capitalize">{campaign.purchase_status}</span>
              </span>
              {campaign.purchase_proof_url && (
                <a
                  href={campaign.purchase_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white flex items-center gap-1"
                >
                  View purchase receipt/proof <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Two Clean Donation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ======================================= */}
        {/* INDIA - UPI CARD                        */}
        {/* ======================================= */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-700/80 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase font-bold tracking-wider text-blue-400 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" />
                India
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50 font-mono">
                0% Fees
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white">UPI Payment</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Direct transfer via Google Pay, PhonePe, Paytm, or any UPI app.
            </p>

            {/* UPI ID Display & Copy Button */}
            <div className="mt-4 p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between gap-2">
              <div className="overflow-hidden">
                <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-wider">UPI VPA</span>
                <span className="text-sm font-mono font-medium text-zinc-200 select-all truncate block">
                  {upiId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="shrink-0 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700"
                title="Copy UPI ID"
                aria-label="Copy UPI ID"
              >
                {copiedUpi ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* QR Code Trigger */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-blue-400 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Show UPI QR Code</span>
              </button>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 pt-4 border-t border-zinc-800/80">
            <button
              type="button"
              disabled={!isFundraisingActive}
              onClick={() => onOpenVerificationModal('upi')}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                isFundraisingActive
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:shadow-blue-500/20 active:scale-[0.99]'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>I've donated via UPI</span>
            </button>
            <p className="text-[11px] text-zinc-500 text-center mt-2">
              Submit your UTR/Reference number for verification
            </p>
          </div>
        </div>

        {/* ======================================= */}
        {/* INTERNATIONAL - CARD PAYMENT CARD       */}
        {/* ======================================= */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-700/80 transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase font-bold tracking-wider text-blue-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                International
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50 font-mono">
                Card / Gateway
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white">International Payment</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Credit / Debit card or international digital wallets via external secure checkout.
            </p>

            {/* External Payment Gateway Button */}
            <div className="mt-4">
              <a
                href={isFundraisingActive ? paymentUrl : '#'}
                target={isFundraisingActive ? '_blank' : '_self'}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!isFundraisingActive) e.preventDefault();
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border ${
                  isFundraisingActive
                    ? 'bg-zinc-800 hover:bg-zinc-700/90 text-zinc-100 border-zinc-700 hover:border-zinc-600'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <span>Donate by card</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </a>
              <span className="text-[11px] text-zinc-500 block mt-1.5 text-center">
                Opens secure external payment provider (TYVM / Gateway)
              </span>
            </div>
          </div>

          {/* Verification Trigger */}
          <div className="mt-6 pt-4 border-t border-zinc-800/80">
            <div className="text-center mb-2">
              <span className="text-xs text-zinc-400 font-medium">Already donated?</span>
            </div>
            <button
              type="button"
              disabled={!isFundraisingActive}
              onClick={() => onOpenVerificationModal('international')}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                isFundraisingActive
                  ? 'bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 hover:text-blue-200'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Submit payment for verification</span>
            </button>
            <p className="text-[11px] text-zinc-500 text-center mt-2">
              Verify your international transaction ID to appear on the tracker
            </p>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white text-sm p-1"
            >
              ✕
            </button>

            <h3 className="text-base font-semibold text-white mb-1">Scan UPI QR</h3>
            <p className="text-xs text-zinc-400 mb-4">Use any UPI app (GPay, PhonePe, Paytm)</p>

            <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-4 shadow-md">
              <img
                src={CAMPAIGN_CONFIG.UPI_QR_IMAGE}
                alt="UPI QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>

            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-mono text-zinc-300 break-all mb-4">
              {upiId}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyUpi}
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 flex items-center justify-center gap-1.5 transition-colors border border-zinc-700"
              >
                {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQrModal(false);
                  onOpenVerificationModal('upi');
                }}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-colors"
              >
                I've Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
