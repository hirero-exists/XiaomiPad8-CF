import React from 'react';

export const WhyNeeded: React.FC = () => {
  return (
    <section className="py-6 sm:py-8 border-b border-neutral-800/80">
      <div className="max-w-2xl">
        <h2 className="text-base font-semibold text-neutral-100 mb-2">
          Why is this device needed?
        </h2>

        <div className="text-xs sm:text-sm text-neutral-400 space-y-2.5 leading-relaxed">
          <p>
            A dedicated Xiaomi Pad 8 allows proper testing of ROM builds, kernel changes, hardware-specific fixes and device issues.
          </p>
          <p>
            Without physical hardware, many bugs cannot be reliably reproduced or tested.
          </p>
          <p>
            The device will be used for development and testing related to Xiaomi Pad 8 community support.
          </p>
        </div>
      </div>
    </section>
  );
};
