import React from 'react';
import { CampaignData } from '../lib/types';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  campaign: CampaignData;
  totalUsdRaised: number;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  campaign,
  totalUsdRaised,
  onOpenAdmin,
  isAdminLoggedIn
}) => {
  const isGoalReached = campaign.campaign_status === 'goal_reached' || totalUsdRaised >= campaign.usd_goal;

  return (
    <header className="border-b border-neutral-800/80 bg-[#0a0a0a]/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-content mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
        {/* Left: Project Brand */}
        <div className="flex items-center gap-2">
          <a href="#/" className="text-sm font-semibold tracking-tight text-neutral-100 hover:text-white transition-colors">
            xiaomi-pad-8 <span className="text-neutral-500 font-normal">/ funding</span>
          </a>
        </div>

        {/* Right: Status & Admin */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs">
          {/* Status pill */}
          <div className="flex items-center gap-1.5 font-mono text-neutral-400">
            <span
              className={`w-2 h-2 rounded-full ${
                isGoalReached ? 'bg-emerald-400' : 'bg-blue-500'
              }`}
            />
            <span className="hidden sm:inline">
              {isGoalReached ? 'Goal reached' : `$${totalUsdRaised} / $${campaign.usd_goal}`}
            </span>
          </div>

          <button
            onClick={onOpenAdmin}
            className={`font-mono text-xs px-2 py-1 rounded transition-colors ${
              isAdminLoggedIn
                ? 'text-blue-400 hover:text-blue-300 bg-neutral-900'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {isAdminLoggedIn ? 'admin ✓' : 'admin'}
          </button>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-1 text-center text-[11px] text-neutral-400 flex items-center justify-center gap-2">
          <span>Local preview mode. Connect Supabase credentials in <code className="text-neutral-300">.env</code> for cloud sync.</span>
          <button onClick={onOpenAdmin} className="underline text-neutral-300 hover:text-white">
            Setup guide
          </button>
        </div>
      )}
    </header>
  );
};
