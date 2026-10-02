import React from 'react';

export const RefundPolicy: React.FC = () => {
  return (
    <section className="py-6 sm:py-8 border-b border-neutral-800/80">
      <div className="max-w-2xl">
        <h2 className="text-base font-semibold text-neutral-100 mb-3">
          What happens if the funding goal is not reached?
        </h2>

        <div className="text-xs sm:text-sm text-neutral-400 space-y-3 leading-relaxed">
          <p>
            If the funding goal is not reached, we will attempt to return all contributions. UPI contributions will be refunded manually. Contributions made through third-party payment services will be refunded through the original payment method where supported by that provider. If direct platform refunds are unavailable, donors will be contacted to arrange an alternative refund method. Payment-processing or currency-conversion fees that are not returned by the provider may be non-refundable.
          </p>
          <p>
            No collected funds will be used to purchase the device unless the funding requirement is reached.
          </p>
          <p>
            If the target cannot be completed for another reason before the device is purchased, the same refund process will apply.
          </p>
        </div>
      </div>
    </section>
  );
};
