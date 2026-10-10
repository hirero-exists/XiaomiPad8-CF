import React, { useEffect, useRef, useState } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { PaymentMethod } from "../lib/types";
import { submitDonation } from "../lib/supabase";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMethod: PaymentMethod;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  initialMethod,
}) => {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>(initialMethod);
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>(
    initialMethod === "upi" ? "INR" : "USD",
  );
  const [reference, setReference] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [showName, setShowName] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const submittingRef = useRef(isSubmitting);
  closeRef.current = onClose;
  submittingRef.current = isSubmitting;

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submittingRef.current) closeRef.current();
      if (event.key !== "Tab") return;
      const controls = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]",
        ) || [],
      );
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) {
        event.preventDefault();
        return;
      }
      const outsideControls = !controls.includes(
        document.activeElement as HTMLElement,
      );
      if (
        event.shiftKey &&
        (document.activeElement === first || outsideControls)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || outsideControls)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (submitted) dialogRef.current?.focus();
  }, [submitted]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }

    if (!reference.trim()) {
      setErrorMessage("Reference / UTR number is required.");
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
        setErrorMessage(res.error || "Submission failed. Please try again.");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setAmount("");
    setReference("");
    setDisplayName("");
    setMessage("");
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-dialog-title"
        tabIndex={-1}
        className="donation-modal bg-[#191b1f] border border-neutral-800 rounded-xl max-w-md w-full p-5 sm:p-6 relative shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          /* Confirmation */
          <div className="text-center py-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>

            <h3
              id="donation-dialog-title"
              className="text-lg font-semibold text-neutral-100 mb-1"
            >
              Payment details submitted
            </h3>

            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              It will appear on the public tracker after verification.
            </p>

            <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800/80 text-left text-[11px] text-neutral-500 font-mono mb-4">
              Reference: <span className="text-neutral-300">{reference}</span>
              <br />
              Status:{" "}
              <span className="text-blue-400">pending admin review</span>
              <br />
              Reference numbers are kept private and never shown publicly.
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full py-2.5 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-200 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form */
          <div>
            <div className="mb-4">
              <h3
                id="donation-dialog-title"
                className="text-lg font-semibold text-neutral-100"
              >
                Submit your payment details
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Submit transaction details for payment verification.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Method Toggle */}
              <div>
                <label className="block text-neutral-400 mb-1">
                  Payment method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("upi");
                      setCurrency("INR");
                    }}
                    className={`py-2 px-3 rounded-lg border text-center font-mono transition-colors ${
                      paymentMethod === "upi"
                        ? "bg-neutral-800 border-neutral-600 text-white"
                        : "bg-neutral-950 border-neutral-800 text-neutral-400"
                    }`}
                  >
                    UPI
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("international");
                      if (currency === "INR") setCurrency("USD");
                    }}
                    className={`py-2 px-3 rounded-lg border text-center font-mono transition-colors ${
                      paymentMethod === "international"
                        ? "bg-neutral-800 border-neutral-600 text-white"
                        : "bg-neutral-950 border-neutral-800 text-neutral-400"
                    }`}
                  >
                    International
                  </button>
                </div>
              </div>

              {/* Amount and Currency */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label
                    htmlFor="amount"
                    className="block text-neutral-400 mb-1"
                  >
                    Amount paid *
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
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 font-mono"
                  />
                </div>

                <div>
                  <label
                    htmlFor="currency"
                    className="block text-neutral-400 mb-1"
                  >
                    Currency
                  </label>
                  <select
                    id="currency"
                    disabled={paymentMethod === "upi"}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-2 text-neutral-100 focus:outline-none focus:border-neutral-600 font-mono"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Reference */}
              <div>
                <label
                  htmlFor="reference"
                  className="block text-neutral-400 mb-1"
                >
                  {paymentMethod === "upi"
                    ? "UPI transaction reference (UTR)"
                    : "Transaction / Reference ID"}{" "}
                  *
                </label>
                <input
                  id="reference"
                  maxLength={200}
                  type="text"
                  required
                  placeholder={
                    paymentMethod === "upi"
                      ? "e.g. 402918274619"
                      : "e.g. tx_01HJ8Z..."
                  }
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 font-mono"
                />
                <span className="text-[10px] text-neutral-500 block mt-0.5">
                  Private & strictly confidential. Admin only.
                </span>
              </div>

              {/* Display Name */}
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-neutral-400 mb-1"
                >
                  Display name{" "}
                  <span className="text-neutral-600">(optional)</span>
                </label>
                <input
                  id="displayName"
                  maxLength={100}
                  type="text"
                  placeholder="e.g. Kazu"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                />
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  id="showName"
                  type="checkbox"
                  checked={showName}
                  onChange={(e) => setShowName(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-neutral-950 border-neutral-800 text-blue-600 focus:ring-0 focus:outline-none"
                />
                <label
                  htmlFor="showName"
                  className="text-neutral-300 select-none cursor-pointer"
                >
                  Show my name on the public contribution list
                </label>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-neutral-400 mb-1"
                >
                  Message (optional)
                </label>
                <input
                  id="message"
                  maxLength={1000}
                  type="text"
                  placeholder="e.g. For kernel trees"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-[var(--accent)] hover:bg-[#d6e2ff] disabled:bg-neutral-800 text-xs font-mono font-medium text-[#131924] transition-colors flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
