import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Milestones } from './components/Milestones';
import { DevicePurchased } from './components/DevicePurchased';
import { DonationMethods } from './components/DonationMethods';
import { WhyNeeded } from './components/WhyNeeded';
import { Transparency } from './components/Transparency';
import { RefundPolicy } from './components/RefundPolicy';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { DonationModal } from './components/DonationModal';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';
import { CampaignData, FundingSummary, PublicDonation, PaymentMethod } from './lib/types';
import {
  fetchCampaignData,
  fetchFundingSummary,
  fetchPublicDonations,
  supabase,
  isSupabaseConfigured
} from './lib/supabase';
import { getLiveRates } from './lib/exchangeRate';
import { CAMPAIGN_CONFIG } from './config';

export function App() {
  // Navigation: 'campaign' | 'dashboard' | 'admin'
  const [currentView, setCurrentView] = useState<'campaign' | 'dashboard' | 'admin'>(() => {
    const hash = window.location.hash;
    if (hash === '#/admin' || window.location.pathname.endsWith('/admin')) return 'admin';
    if (hash === '#/dashboard' || window.location.pathname.endsWith('/dashboard')) return 'dashboard';
    return 'campaign';
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Campaign & funding state
  const [campaign, setCampaign] = useState<CampaignData>({
    id: 'xiaomi_pad_8',
    usd_goal: CAMPAIGN_CONFIG.COMMUNITY_GOAL_USD,
    device_price_inr: CAMPAIGN_CONFIG.DEVICE_PRICE_INR,
    fundraising_enabled: true,
    campaign_status: 'fundraising',
    payment_url: CAMPAIGN_CONFIG.INTERNATIONAL_PAYMENT_URL,
    upi_id: CAMPAIGN_CONFIG.UPI_ID,
    purchase_status: 'pending',
    purchase_proof_url: '',
    purchase_notes: '',
    updated_at: new Date().toISOString(),
  });

  const [summary, setSummary] = useState<FundingSummary>({
    total_usd_raised: 0,
    total_inr_raised: 0,
    verified_count: 0,
  });

  const [donations, setDonations] = useState<PublicDonation[]>([]);
  const [fxRate, setFxRate] = useState<number>(CAMPAIGN_CONFIG.FALLBACK_USD_TO_INR);

  // Verification modal state
  const [modalMethod, setModalMethod] = useState<PaymentMethod | null>(null);

  // Hash synchronization
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/admin') {
        setCurrentView('admin');
      } else if (hash === '#/dashboard') {
        setCurrentView('dashboard');
      } else {
        setCurrentView('campaign');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: 'campaign' | 'dashboard' | 'admin') => {
    setCurrentView(view);
    if (view === 'admin') window.location.hash = '#/admin';
    else if (view === 'dashboard') window.location.hash = '#/dashboard';
    else window.location.hash = '#/';
  };

  // Auth session check
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      const mockSession = localStorage.getItem('xiaomi_pad_8_mock_admin_session');
      setIsAdminLoggedIn(mockSession === 'true');
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdminLoggedIn(Boolean(session));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdminLoggedIn(Boolean(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch campaign and public data
  const loadData = useCallback(async () => {
    try {
      const [campaignData, summaryData, donationsData, rates] = await Promise.all([
        fetchCampaignData(),
        fetchFundingSummary(),
        fetchPublicDonations(),
        getLiveRates(),
      ]);

      setCampaign(campaignData);
      setSummary(summaryData);
      setDonations(donationsData);
      setFxRate(rates.INR);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isGoalReached =
    summary.total_usd_raised >= (campaign.usd_goal || CAMPAIGN_CONFIG.COMMUNITY_GOAL_USD) ||
    campaign.campaign_status === 'goal_reached';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)] selection:bg-neutral-100 selection:text-neutral-900">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        campaign={campaign}
        totalUsdRaised={summary.total_usd_raised}
        totalInrRaised={summary.total_inr_raised}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'admin' ? (
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            {isAdminLoggedIn ? (
              <AdminDashboard
                campaign={campaign}
                onRefreshCampaign={loadData}
                onLogout={() => setIsAdminLoggedIn(false)}
                onBackToSite={() => navigateTo('campaign')}
              />
            ) : (
              <AdminLogin
                onLoginSuccess={() => setIsAdminLoggedIn(true)}
                onBackToSite={() => navigateTo('campaign')}
              />
            )}
          </div>
        ) : currentView === 'dashboard' ? (
          <DashboardView
            summary={summary}
            campaign={campaign}
            donations={donations}
            fxRate={fxRate}
            onNavigateToCampaign={() => navigateTo('campaign')}
            onOpenVerificationModal={(method) => setModalMethod(method)}
          />
        ) : (
          /* Campaign View */
          <div>
            {/* 01 // Hero & Live Stats Strip */}
            <Hero
              campaign={campaign}
              summary={summary}
              fxRate={fxRate}
              onNavigateToDashboard={() => navigateTo('dashboard')}
            />

            {/* 02 // Why this device? */}
            <WhyNeeded />

            {/* 03 // Hardware specs & co-funding */}
            <DevicePurchased
              campaign={campaign}
              fxRate={fxRate}
            />

            {/* 04 // Milestones */}
            <Milestones
              totalUsdRaised={summary.total_usd_raised}
              totalInrRaised={summary.total_inr_raised}
              fxRate={fxRate}
            />

            {/* 05 // Payment methods */}
            <DonationMethods
              campaign={campaign}
              onOpenVerificationModal={(method) => setModalMethod(method)}
              isGoalReached={isGoalReached}
            />

            {/* 06 // Verification & Transparency */}
            <Transparency />

            {/* 07 // Refund policy */}
            <RefundPolicy />
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <Footer onOpenAdmin={() => navigateTo('admin')} />

      {/* Payment Verification Modal */}
      {modalMethod && (
        <DonationModal
          isOpen={Boolean(modalMethod)}
          initialMethod={modalMethod}
          onClose={() => {
            setModalMethod(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

export default App;
