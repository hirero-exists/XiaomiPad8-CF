import React from 'react';
import { CAMPAIGN_CONFIG } from '../config';

export const Hero: React.FC = () => {
  return (
    <section className="pt-8 pb-8 sm:pt-12 sm:pb-12 border-b border-neutral-800/80">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
        {/* Text */}
        <div className="md:col-span-7 flex flex-col items-start">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2">
            Open Source Hardware Fund
          </span>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-100 leading-tight">
            Xiaomi Pad 8 <br className="hidden sm:inline" />
            <span className="text-neutral-400 font-normal">Development Crowdfunding</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-neutral-400 leading-relaxed max-w-lg">
            Help fund a dedicated Xiaomi Pad 8 for ROM development, testing, debugging and long-term device support.
          </p>

          <div className="mt-5 flex items-center gap-2 text-xs font-mono text-neutral-500">
            <span>Target: <strong className="text-neutral-300 font-semibold">$350 USD</strong></span>
            <span>•</span>
            <span>12GB + 256GB + Pen</span>
          </div>
        </div>

        {/* Image */}
        <div className="md:col-span-5 flex justify-center items-center mt-2 md:mt-0">
          <div className="w-full max-w-[280px] sm:max-w-[340px] flex justify-center">
            <img
              src={CAMPAIGN_CONFIG.DEVICE_IMAGE_PATH}
              alt="Xiaomi Pad 8 Tablet"
              className="w-full h-auto object-contain select-none filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
