import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FundingProgress } from './components/FundingProgress';
import { Milestones } from './components/Milestones';
import { DevicePurchased } from './components/DevicePurchased';
import { DonationMethods } from './components/DonationMethods';
import { RecentDonations } from './components/RecentDonations';
import { WhyNeeded } from './components/WhyNeeded';
import { Transparency } from './components/Transparency';
import { RefundPolicy } from './components/RefundPolicy';
import { Footer } from './components/Footer';
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
  // Routing state
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.hash === '#/admin' || window.location.pathname.endsWith('/admin');
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

  // Donation Modal state
  const [modalMethod, setModalMethod] = useState<PaymentMethod | null>(null);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminView(window.location.hash === '#/admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Check auth session
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
  const loadPublicData = useCallback(async () => {
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
      console.error('Error loading public data:', err);
    }
  }, []);

  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  // Admin routing helpers
  const handleOpenAdmin = () => {
    window.location.hash = '#/admin';
    setIsAdminView(true);
  };

  const handleBackToSite = () => {
    window.location.hash = '#/';
    setIsAdminView(false);
    loadPublicData();
  };

  const isGoalReached =
    summary.total_usd_raised >= (campaign.usd_goal || 350) ||
    campaign.campaign_status === 'goal_reached';

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0d0e] text-zinc-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        campaign={campaign}
        onOpenAdmin={handleOpenAdmin}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-content w-full mx-auto px-4 sm:px-6">
        {isAdminView ? (
          isAdminLoggedIn ? (
            <AdminDashboard
              campaign={campaign}
              onRefreshCampaign={loadPublicData}
              onLogout={() => setIsAdminLoggedIn(false)}
              onBackToSite={handleBackToSite}
            />
          ) : (
            <AdminLogin
              onLoginSuccess={() => setIsAdminLoggedIn(true)}
              onBackToSite={handleBackToSite}
            />
          )
        ) : (
          /* Public Single-Page Layout */
          <div className="space-y-2">
            {/* 1. Hero */}
            <Hero />

            {/* 2. Funding Progress */}
            <FundingProgress
              summary={summary}
              campaign={campaign}
              fxRate={fxRate}
            />

            {/* 3. Milestones */}
            <Milestones
              totalUsdRaised={summary.total_usd_raised}
              totalInrRaised={summary.total_inr_raised}
              fxRate={fxRate}
            />

            {/* 4. Device Being Purchased */}
            <DevicePurchased
              campaign={campaign}
              fxRate={fxRate}
            />

            {/* 5. Donation Methods */}
            <DonationMethods
              campaign={campaign}
              onOpenVerificationModal={(method) => setModalMethod(method)}
              isGoalReached={isGoalReached}
            />

            {/* 6. Recent Verified Contributions */}
            <RecentDonations
              donations={donations}
            />

            {/* 7. Why the Device is Needed */}
            <WhyNeeded />

            {/* 8. Transparency */}
            <Transparency />

            {/* 9. Refund Policy */}
            <RefundPolicy />

            {/* 10. Footer */}
            <Footer
              onOpenAdmin={handleOpenAdmin}
            />
          </div>
        )}
      </main>

      {/* Verification Submission Modal */}
      {modalMethod && (
        <DonationModal
          isOpen={Boolean(modalMethod)}
          initialMethod={modalMethod}
          onClose={() => {
            setModalMethod(null);
            loadPublicData();
          }}
        />
      )}
    </div>
  );
}
export default App;
