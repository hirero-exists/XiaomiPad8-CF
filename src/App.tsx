import { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { DevicePurchased } from "./components/DevicePurchased";
import { DonationMethods } from "./components/DonationMethods";
import { WhyNeeded } from "./components/WhyNeeded";
import { Transparency } from "./components/Transparency";
import { Footer } from "./components/Footer";
import { DashboardView } from "./components/DashboardView";
import { DonationModal } from "./components/DonationModal";
import { AdminLogin } from "./admin/AdminLogin";
import { AdminDashboard } from "./admin/AdminDashboard";
import {
  CampaignData,
  FundingSummary,
  PublicDonation,
  PaymentMethod,
  DataStatus,
} from "./lib/types";
import {
  fetchCampaignData,
  fetchFundingSummary,
  fetchPublicDonations,
  supabase,
  isSupabaseConfigured,
  isDesignPreview,
} from "./lib/supabase";
import { getLiveRates } from "./lib/exchangeRate";
import { CAMPAIGN_CONFIG } from "./config";
import { getFundingState } from "./lib/funding";

export function App() {
  // Navigation: 'campaign' | 'dashboard' | 'admin'
  const [currentView, setCurrentView] = useState<
    "campaign" | "dashboard" | "admin"
  >(() => {
    const hash = window.location.hash;
    if (hash === "#/admin" || window.location.pathname.endsWith("/admin"))
      return "admin";
    if (
      hash === "#/dashboard" ||
      window.location.pathname.endsWith("/dashboard")
    )
      return "dashboard";
    return "campaign";
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Campaign & funding state
  const [campaign, setCampaign] = useState<CampaignData>({
    id: "xiaomi_pad_8",
    usd_goal: CAMPAIGN_CONFIG.COMMUNITY_GOAL_USD,
    device_price_inr: CAMPAIGN_CONFIG.DEVICE_PRICE_INR,
    fundraising_enabled: true,
    campaign_status: "fundraising",
    payment_url: CAMPAIGN_CONFIG.INTERNATIONAL_PAYMENT_URL,
    upi_id: CAMPAIGN_CONFIG.UPI_ID,
    purchase_status: "pending",
    purchase_proof_url: "",
    purchase_notes: "",
    updated_at: new Date().toISOString(),
  });

  const [summary, setSummary] = useState<FundingSummary>({
    total_usd_raised: 0,
    total_inr_raised: 0,
    verified_count: 0,
  });

  const [dataStatus, setDataStatus] = useState<DataStatus>("loading");
  const [donations, setDonations] = useState<PublicDonation[]>([]);
  const [fxRate, setFxRate] = useState<number>(
    CAMPAIGN_CONFIG.FALLBACK_USD_TO_INR,
  );

  // Verification modal state
  const [modalMethod, setModalMethod] = useState<PaymentMethod | null>(null);

  // Fetch campaign and public data
  const loadData = useCallback(async () => {
    try {
      const [campaignData, donationsData] = await Promise.all([
        fetchCampaignData(),
        fetchPublicDonations(),
      ]);

      const summaryData = await fetchFundingSummary(donationsData);
      setDataStatus("ready");
      setCampaign(campaignData);
      setSummary(summaryData);
      setDonations(donationsData);
      const rates = isDesignPreview
        ? {
            INR:
              CAMPAIGN_CONFIG.COMMUNITY_GOAL_INR /
              CAMPAIGN_CONFIG.COMMUNITY_GOAL_USD,
          }
        : await getLiveRates();
      setFxRate(rates.INR);
    } catch (err) {
      setDataStatus("unavailable");
      console.error("Error loading data:", err);
    }
  }, []);

  // Hash synchronization
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#/admin") {
        setCurrentView("admin");
      } else if (hash === "#/dashboard") {
        setCurrentView("dashboard");
      } else {
        setCurrentView("campaign");
      }
      loadData();
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [loadData]);

  const navigateTo = (view: "campaign" | "dashboard" | "admin") => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "instant" });
    if (view === "admin") window.location.hash = "#/admin";
    else if (view === "dashboard") window.location.hash = "#/dashboard";
    else window.location.hash = "#/";
    loadData();
  };

  // Auth session check
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsAdminLoggedIn(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdminLoggedIn(Boolean(session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdminLoggedIn(Boolean(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  // Realtime subscription and auto-refresh
  useEffect(() => {
    loadData();
    if (!isSupabaseConfigured) return;

    // Auto-refresh when tab gains focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    };
    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    // Periodic background polling every 15s
    const interval = setInterval(loadData, 15000);

    // Realtime Postgres changes subscription
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel("public_donations_realtime")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "donations" },
            () => {
              loadData();
            },
          )
          .subscribe();
      } catch (err) {
        console.warn(
          "Realtime subscription not available, using polling:",
          err,
        );
      }
    }

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
      clearInterval(interval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadData]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentView]);

  const { goalReached: isGoalReached } = getFundingState(
    campaign,
    summary,
    fxRate,
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)] selection:bg-neutral-100 selection:text-neutral-900">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {/* Top Navbar */}
      <Navbar currentView={currentView} onNavigate={navigateTo} />

      {/* Main View Router */}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {dataStatus === "unavailable" && isSupabaseConfigured && (
          <div role="status" className="site-container campaign-notice">
            Campaign data is unavailable. Please try again later.{" "}
            <button className="text-link underline" onClick={loadData}>
              Try again
            </button>
          </div>
        )}
        {currentView === "admin" ? (
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            {isAdminLoggedIn ? (
              <AdminDashboard
                campaign={campaign}
                onRefreshCampaign={loadData}
                onLogout={() => setIsAdminLoggedIn(false)}
                onBackToSite={() => navigateTo("campaign")}
              />
            ) : (
              <AdminLogin
                onLoginSuccess={() => setIsAdminLoggedIn(true)}
                onBackToSite={() => navigateTo("campaign")}
              />
            )}
          </div>
        ) : currentView === "dashboard" ? (
          <DashboardView
            summary={summary}
            campaign={campaign}
            donations={donations}
            fxRate={fxRate}
            dataStatus={dataStatus}
            onNavigateToCampaign={() => navigateTo("campaign")}
            onOpenVerificationModal={(method) => {
              if (isSupabaseConfigured && dataStatus === "ready")
                setModalMethod(method);
            }}
          />
        ) : (
          /* Campaign View */
          <div>
            {/* 01 // Hero & Live Stats Strip */}
            <Hero
              campaign={campaign}
              summary={summary}
              fxRate={fxRate}
              dataStatus={dataStatus}
              onNavigateToDashboard={() => navigateTo("dashboard")}
            />

            <DonationMethods
              campaign={campaign}
              onOpenVerificationModal={(method) => {
                if (isSupabaseConfigured && dataStatus === "ready")
                  setModalMethod(method);
              }}
              isGoalReached={isGoalReached}
              dataStatus={dataStatus}
            />
            <WhyNeeded />
            <DevicePurchased campaign={campaign} />
            <Transparency />
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <Footer onOpenAdmin={() => navigateTo("admin")} />

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
