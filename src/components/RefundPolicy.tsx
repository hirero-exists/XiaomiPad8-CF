import React from 'react';

export const RefundPolicy: React.FC = () => {
  return (
    <section className="border-b border-[var(--line)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="font-mono text-xs text-[var(--muted)] mb-2">
              07 // REFUND POLICY
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
              What happens if the funding goal is not reached?
            </h2>
          </div>

          <div className="md:col-span-2 space-y-3.5 text-xs sm:text-sm text-neutral-400 leading-relaxed">
            <p>
              If the funding goal is not reached, we will attempt to return all contributions. UPI contributions will be refunded manually. Contributions made through third-party payment services will be refunded through the original payment method where supported by that provider. If direct platform refunds are unavailable, donors will be contacted to arrange an alternative refund method. Payment-processing or currency-conversion fees that are not returned by the provider may be non-refundable.
            </p>
            <p className="text-neutral-300 font-medium">
              No collected funds will be used to purchase the device unless the funding requirement is reached.
            </p>
            <p>
              If the target cannot be completed for another reason before the device is purchased, the same refund process will apply.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
