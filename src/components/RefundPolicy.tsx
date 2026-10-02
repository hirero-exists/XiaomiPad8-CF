import React from 'react';
import { HelpCircle, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CAMPAIGN_CONFIG } from '../config';

export const RefundPolicy: React.FC = () => {
  const policy = CAMPAIGN_CONFIG.REFUND_POLICY;

  return (
    <section className="py-10 border-b border-zinc-800/60">
      <div className="bg-zinc-900/50 border border-zinc-800/90 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2.5 text-zinc-300 mb-2">
          <HelpCircle className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            What happens if the funding goal is not reached?
          </h2>
        </div>

        <p className="text-sm font-medium text-zinc-300 mb-6">
          {policy.primary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-400">
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold">
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>UPI Contributions</span>
            </div>
            <p className="leading-relaxed">
              {policy.upi}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold">
              <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
              <span>International & Card Payments</span>
            </div>
            <p className="leading-relaxed">
              {policy.international}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Alternative Arrangements</span>
            </div>
            <p className="leading-relaxed">
              {policy.alternative}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Non-Refundable Gateway Fees</span>
            </div>
            <p className="leading-relaxed">
              {policy.fees}
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-zinc-800/80 text-xs text-zinc-400 leading-relaxed space-y-1">
          <p className="font-medium text-zinc-300">
            {policy.assurance}
          </p>
        </div>
      </div>
    </section>
  );
};
