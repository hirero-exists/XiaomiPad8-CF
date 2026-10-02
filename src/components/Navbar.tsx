import React from 'react';
import { CampaignData } from '../lib/types';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  currentView: 'campaign' | 'dashboard' | 'admin';
  onNavigate: (view: 'campaign' | 'dashboard' | 'admin') => void;
  campaign: CampaignData;
  totalUsdRaised: number;
  totalInrRaised: number;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  campaign,
  totalUsdRaised,
  totalInrRaised,
  isAdminLoggedIn
}) => {
  const isGoalReached = campaign.campaign_status === 'goal_reached' || totalUsdRaised >= campaign.usd_goal;

  return (
    <header className="relative z-30 border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur sm:sticky sm:top-0">
      {/* Precision marquee ticker like fileish */}
      <div className="overflow-hidden border-b border-[var(--line)] py-1.5 bg-[#070709]">
        <div className="animate-marquee font-mono text-[10px] uppercase tracking-[.2em] text-[var(--muted)] select-none">
          <span className="mx-6">● LIVE TOTALS: ${totalUsdRaised} / ${campaign.usd_goal} USD (≈ ₹{totalInrRaised.toLocaleString('en-IN')})</span>
          <span className="mx-6">//</span>
          <span className="mx-6">XIAOMI PAD 8 ROM BRING-UP FUND</span>
          <span className="mx-6">//</span>
          <span className="mx-6">STATUS: {isGoalReached ? 'GOAL COMPLETED' : 'ACCEPTING CONTRIBUTIONS'}</span>
          <span className="mx-6">//</span>
          <span className="mx-6">MANUAL VERIFICATION ON APPROVAL</span>
          <span className="mx-6">//</span>
          <span className="mx-6">● LIVE TOTALS: ${totalUsdRaised} / ${campaign.usd_goal} USD (≈ ₹{totalInrRaised.toLocaleString('en-IN')})</span>
          <span className="mx-6">//</span>
          <span className="mx-6">XIAOMI PAD 8 ROM BRING-UP FUND</span>
          <span className="mx-6">//</span>
          <span className="mx-6">STATUS: {isGoalReached ? 'GOAL COMPLETED' : 'ACCEPTING CONTRIBUTIONS'}</span>
          <span className="mx-6">//</span>
          <span className="mx-6">MANUAL VERIFICATION ON APPROVAL</span>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        {/* Brand */}
        <button
          onClick={() => onNavigate('campaign')}
          className="flex items-center gap-2 text-left group"
        >
          <span className="font-mono text-xs font-bold text-neutral-400 group-hover:text-white px-1.5 py-0.5 border border-neutral-700 rounded bg-neutral-900">
            P8
          </span>
          <span className="font-semibold text-sm tracking-tight text-neutral-100 group-hover:text-white">
            Xiaomi Pad 8 <span className="text-[var(--muted)] font-mono text-xs font-normal">/ fund</span>
          </span>
        </button>

        {/* View Switcher: Campaign / Dashboard / Admin */}
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2 text-xs font-mono">
          <button
            onClick={() => onNavigate('campaign')}
            className={`px-2.5 py-1.5 rounded transition-colors ${
              currentView === 'campaign'
                ? 'text-white bg-neutral-800 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Campaign
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-2.5 py-1.5 rounded transition-colors ${
              currentView === 'dashboard'
                ? 'text-white bg-neutral-800 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className={`px-2.5 py-1.5 rounded transition-colors ${
              currentView === 'admin'
                ? 'text-blue-400 bg-neutral-800 border border-neutral-700'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {isAdminLoggedIn ? 'Admin ✓' : 'Admin'}
          </button>
        </nav>
      </div>

      {!isSupabaseConfigured && (
        <div className="bg-neutral-950 border-b border-neutral-800/80 px-4 py-1 text-center font-mono text-[11px] text-neutral-400 flex items-center justify-center gap-2">
          <span>Local preview mode. Configure Supabase in <code className="text-neutral-300">.env</code> for cloud database sync.</span>
          <button onClick={() => onNavigate('admin')} className="underline text-neutral-200 hover:text-white">
            Setup Guide
          </button>
        </div>
      )}
    </header>
  );
};
