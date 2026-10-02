import React from 'react';

export const WhyNeeded: React.FC = () => {
  return (
    <section className="border-b border-[var(--line)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="font-mono text-xs text-[var(--muted)] mb-2">
              02 // WHY THIS DEVICE?
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
              Not just a tablet — a bring-up target.
            </h2>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed mb-6">
              A dedicated Xiaomi Pad 8 allows proper testing of ROM builds, kernel changes, hardware-specific fixes, and device issues. Without physical hardware, many bugs cannot be reliably reproduced or tested. The device will be used for development and testing related to Xiaomi Pad 8 community support.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-neutral-900/60 border border-[var(--line)]">
                <span className="font-mono text-xs text-blue-400 font-bold block mb-1">01</span>
                <span className="text-xs font-semibold text-neutral-200 block mb-1">Custom ROM bring-up</span>
                <span className="text-[11px] text-[var(--muted)] block">AOSP trees, display configs, and custom recoveries.</span>
              </div>

              <div className="p-4 rounded-lg bg-neutral-900/60 border border-[var(--line)]">
                <span className="font-mono text-xs text-blue-400 font-bold block mb-1">02</span>
                <span className="text-xs font-semibold text-neutral-200 block mb-1">Kernel & device-tree</span>
                <span className="text-[11px] text-[var(--muted)] block">Snapdragon kernel patches, stylus latency, and audio HALs.</span>
              </div>

              <div className="p-4 rounded-lg bg-neutral-900/60 border border-[var(--line)]">
                <span className="font-mono text-xs text-blue-400 font-bold block mb-1">03</span>
                <span className="text-xs font-semibold text-neutral-200 block mb-1">Open-source, audited</span>
                <span className="text-[11px] text-[var(--muted)] block">Every contribution is recorded and publicly accounted for.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
