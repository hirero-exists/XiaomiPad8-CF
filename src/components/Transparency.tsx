import React from 'react';

export const Transparency: React.FC = () => {
  return (
    <section className="py-6 sm:py-8 border-b border-neutral-800/80">
      <div className="max-w-2xl">
        <h2 className="text-base font-semibold text-neutral-100 mb-2">
          Tracking & Verification
        </h2>

        <div className="text-xs sm:text-sm text-neutral-400 space-y-2 leading-relaxed">
          <p>
            All contributions are added to the public tracker only after payment verification.
          </p>
          <p>
            UPI and external payment submissions remain private while verification is pending. Only verified contributions are included in the public total.
          </p>
          <p className="text-neutral-500 text-xs">
            Transaction/reference numbers are never displayed publicly.
          </p>
        </div>
      </div>
    </section>
  );
};
