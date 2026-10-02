import React from 'react';
import { Eye, ShieldCheck, Lock } from 'lucide-react';

export const Transparency: React.FC = () => {
  return (
    <section className="py-10 border-b border-zinc-800/60">
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-3 text-blue-400">
          <Eye className="w-4 h-4" />
          <h2 className="text-sm font-semibold uppercase tracking-wider">
            Verification & Transparency
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-400 leading-relaxed">
          <div className="space-y-2.5">
            <div className="flex items-start gap-2 text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                All contributions are added to the public tracker only after payment verification.
              </span>
            </div>
            <p className="pl-6 text-zinc-500">
              UPI and external payment submissions remain strictly private while verification is pending. Only verified contributions are included in the public total.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-start gap-2 text-zinc-300">
              <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                Transaction and reference numbers are never displayed publicly.
              </span>
            </div>
            <p className="pl-6 text-zinc-500">
              Your banking UTR or card transaction identifiers are kept strictly confidential in the private database schema and are only accessible by the developer to confirm receipts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
