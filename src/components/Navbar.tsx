import React from 'react';
import { ShieldCheck, Lock, ExternalLink } from 'lucide-react';
import { CampaignData } from '../lib/types';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  campaign: CampaignData;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ campaign, onOpenAdmin, isAdminLoggedIn }) => {
  const isGoalReached = campaign.campaign_status === 'goal_reached' || campaign.campaign_status === 'completed';

  return (
    <header className="border-b border-zinc-800/80 bg-[#0c0d0e]/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-content mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Project Branding */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-semibold text-xs">
            P8
          </div>
          <span className="font-medium text-sm tracking-tight text-zinc-200">
            Xiaomi Pad 8 <span className="text-zinc-500 hidden sm:inline">/ Dev Fund</span>
          </span>
        </div>

        {/* Status & Quick Links */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          {isGoalReached ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Goal Reached 🎉
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-950/40 border border-blue-500/20 text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              Funding in progress
            </span>
          )}

          {/* Admin shortcut button */}
          <button
            onClick={onOpenAdmin}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors border ${
              isAdminLoggedIn
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 hover:bg-blue-500/25'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
            title={isAdminLoggedIn ? "Open Admin Dashboard" : "Admin Login"}
          >
            {isAdminLoggedIn ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Admin</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3 text-zinc-500" />
                <span className="hidden sm:inline">Admin</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="bg-amber-950/50 border-b border-amber-800/40 px-4 py-1.5 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
          <span>⚡ Running in preview mode with local mock storage. Connect Supabase for live cloud persistence.</span>
          <button
            onClick={onOpenAdmin}
            className="underline font-medium hover:text-amber-200 flex items-center gap-0.5"
          >
            Setup Guide <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </header>
  );
};
