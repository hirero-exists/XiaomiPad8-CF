import React, { useState } from 'react';
import { X, CheckCircle, ShieldAlert, Loader2, Lock } from 'lucide-react';
import { PaymentMethod } from '../lib/types';
import { submitDonation } from '../lib/supabase';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMethod: PaymentMethod;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  initialMethod
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialMethod);
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>(initialMethod === 'upi' ? 'INR' : 'USD');
  const [reference, setReference] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [showName, setShowName] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid donation amount.');
      return;
    }

    if (!reference.trim()) {
      setErrorMessage('Transaction / reference number is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitDonation({
        payment_method: paymentMethod,
        native_amount: parsedAmount,
        native_currency: currency,
        payment_reference: reference,
        display_name: displayName,
        show_name: showName,
        message: message,
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(res.error || 'Failed to submit verification request. Please try again.');
      }
    } catch {
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setAmount('');
    setReference('');
    setDisplayName('');
    setMessage('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 sm:p-7 relative shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          /* Success Screen */
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <CheckCircle className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Payment submitted
            </h3>

            <p className="text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed mb-6">
              It will appear on the public tracker after verification.
            </p>

            <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4 text-left text-xs text-zinc-400 space-y-2 mb-6">
              <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Privacy Guarantee</span>
              </div>
              <p>
                Your reference number (<span className="font-mono text-zinc-300">{reference}</span>) has been securely encrypted and stored for administrator verification only. It will never be displayed publicly.
              </p>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* Submission Form */
          <div>
            <div className="mb-6">
              <h3 id="modal-title" className="text-xl font-bold text-white">
                Submit Payment for Verification
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your transaction details so we can verify your contribution on the public funding tracker.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('upi');
                      setCurrency('INR');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                      paymentMethod === 'upi'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    UPI Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('international');
                      if (currency === 'INR') setCurrency('USD');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                      paymentMethod === 'international'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    International Gateway
                  </button>
                </div>
              </div>

              {/* Amount and Currency */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label htmlFor="amount" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Amount Paid <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="amount"
                    type="number"
                    step="any"
                    min="1"
                    required
                    placeholder="e.g. 500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 font-mono transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="currency" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono transition-colors"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Transaction / Reference Number */}
              <div>
                <label htmlFor="reference" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  {paymentMethod === 'upi' ? 'UPI UTR / 12-digit Ref No.' : 'Transaction / Order ID'}{' '}
                  <span className="text-red-400">*</span>
                </label>
                <input
                  id="reference"
                  type="text"
                  required
                  placeholder={paymentMethod === 'upi' ? 'e.g. 402918274619' : 'e.g. tx_01HJ8Z...'}
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 font-mono transition-colors"
                />
                <span className="text-[11px] text-zinc-500 block mt-1">
                  Private & confidential. Used solely for admin verification.
                </span>
              </div>

              {/* Display Name */}
              <div>
                <label htmlFor="displayName" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Display Name <span className="text-zinc-500">(optional)</span>
                </label>
                <input
                  id="displayName"
                  type="text"
                  placeholder="e.g. Kazu or Alex"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Show Name Checkbox */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  id="showName"
                  type="checkbox"
                  checked={showName}
                  onChange={(e) => setShowName(e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-950 border-zinc-800 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0 focus:outline-none"
                />
                <label htmlFor="showName" className="text-xs text-zinc-300 select-none cursor-pointer">
                  Show my name publicly on the verified backers list
                </label>
              </div>
              {!showName && (
                <p className="text-[11px] text-zinc-500 pl-6">
                  Will appear as <strong className="text-zinc-400">Anonymous</strong> on the public list.
                </p>
              )}

              {/* Optional Note / Message */}
              <div>
                <label htmlFor="message" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Message / Note <span className="text-zinc-500">(optional)</span>
                </label>
                <textarea
                  id="message"
                  rows={2}
                  placeholder="e.g. Looking forward to LineageOS support!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 resize-none transition-colors"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-sm font-medium text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit for verification</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
