import React from 'react';

export const Transparency: React.FC = () => {
  return (
    <section className="border-b border-[var(--line)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="font-mono text-xs text-[var(--muted)] mb-2">
              06 // VERIFICATION & TRANSPARENCY
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
              Manual review & privacy.
            </h2>
          </div>

          <div className="md:col-span-2 space-y-3 text-xs sm:text-sm text-neutral-400 leading-relaxed">
            <p>
              All contributions are added to the public tracker only after payment verification.
            </p>
            <p>
              UPI and external payment submissions remain private while verification is pending. Only verified contributions are included in the public total.
            </p>
            <p className="font-mono text-xs text-[var(--muted)] pt-1">
              Note: Transaction/reference numbers are never displayed publicly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
