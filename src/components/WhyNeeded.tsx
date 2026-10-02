import React from 'react';
import { Cpu, Bug, Wrench } from 'lucide-react';

export const WhyNeeded: React.FC = () => {
  return (
    <section className="py-10 border-b border-zinc-800/60">
      <div className="max-w-2xl">
        <h2 className="text-xl font-bold tracking-tight text-white mb-3">
          Why is this device needed?
        </h2>

        <div className="text-sm text-zinc-400 space-y-3 leading-relaxed">
          <p>
            A dedicated Xiaomi Pad 8 allows proper testing of ROM builds, kernel changes, hardware-specific fixes, and device issues.
          </p>
          <p>
            Without physical hardware, many bugs cannot be reliably reproduced or tested.
          </p>
          <p>
            The device will be used directly for development and testing related to Xiaomi Pad 8 community support, trees, and custom recoveries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 flex items-start gap-2.5">
            <Cpu className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-medium text-zinc-200 block">Kernel & DTS</span>
              <span className="text-zinc-500">Bringing up Linux kernel & display trees</span>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 flex items-start gap-2.5">
            <Bug className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-medium text-zinc-200 block">Hardware Fixes</span>
              <span className="text-zinc-500">Audio, stylus latency & camera sensor HALs</span>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 flex items-start gap-2.5">
            <Wrench className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-medium text-zinc-200 block">Long-term Support</span>
              <span className="text-zinc-500">Stable, reproducible AOSP-based ROM builds</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
