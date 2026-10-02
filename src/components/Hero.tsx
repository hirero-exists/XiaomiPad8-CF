import React from 'react';
import { Terminal, Cpu } from 'lucide-react';
import { CAMPAIGN_CONFIG } from '../config';

export const Hero: React.FC = () => {
  return (
    <section className="pt-8 pb-10 sm:pt-14 sm:pb-14 border-b border-zinc-800/60">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Heading and Subtitle */}
        <div className="md:col-span-7 flex flex-col items-start">
          {/* Subtle badges */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-400 mb-5">
            <span className="flex items-center gap-1 text-blue-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>AOSP & Kernel Dev</span>
            </span>
            <span className="text-zinc-600">•</span>
            <span>Community Supported</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Xiaomi Pad 8 <br />
            <span className="text-zinc-400">Development Crowdfunding</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl">
            Help fund a dedicated Xiaomi Pad 8 for ROM development,
            testing, debugging and long-term device support.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Snapdragon Platform</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>12GB RAM + 256GB + Pen</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
              <span>Goal: $350 USD</span>
            </div>
          </div>
        </div>

        {/* Right Column: Tablet illustration */}
        <div className="md:col-span-5 flex justify-center items-center">
          <div className="relative group max-w-sm sm:max-w-md w-full flex justify-center">
            {/* Soft subtle glow behind tablet */}
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full transform -translate-y-4 scale-90 pointer-events-none"></div>

            <img
              src={CAMPAIGN_CONFIG.DEVICE_IMAGE_PATH}
              alt="Xiaomi Pad 8 Transparent Illustration"
              className="relative z-10 w-full max-h-[300px] sm:max-h-[360px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] select-none transition-transform duration-500 hover:scale-[1.02]"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
