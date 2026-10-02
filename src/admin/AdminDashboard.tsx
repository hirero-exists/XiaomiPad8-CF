import React, { useState, useEffect } from 'react';
import {
  LogOut,
  ArrowLeft,
  Check,
  X,
  Copy,
  Clock,
  Settings,
  History,
  TrendingUp,
  HelpCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Donation, CampaignData } from '../lib/types';
import {
  fetchAdminDonations,
  approveDonationAction,
  rejectDonationAction,
  updateCampaignSettings,
  supabase
} from '../lib/supabase';
import { getLiveRates } from '../lib/exchangeRate';

interface AdminDashboardProps {
  campaign: CampaignData;
  onRefreshCampaign: () => void;
  onLogout: () => void;
  onBackToSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  campaign,
  onRefreshCampaign,
  onLogout,
  onBackToSite
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'campaign' | 'history' | 'setup'>('pending');

  const [pendingList, setPendingList] = useState<Donation[]>([]);
  const [approvedList, setApprovedList] = useState<Donation[]>([]);
  const [rejectedList, setRejectedList] = useState<Donation[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // FX Rate state
  const [currentFxRate, setCurrentFxRate] = useState<number>(86.8);
  const [customRate, setCustomRate] = useState<string>('86.8');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Campaign Settings form state
  const [campaignStatus, setCampaignStatus] = useState(campaign.campaign_status);
  const [fundraisingEnabled, setFundraisingEnabled] = useState(campaign.fundraising_enabled);
  const [purchaseStatus, setPurchaseStatus] = useState(campaign.purchase_status);
  const [purchaseProofUrl, setPurchaseProofUrl] = useState(campaign.purchase_proof_url);
  const [purchaseNotes, setPurchaseNotes] = useState(campaign.purchase_notes);
  const [upiId, setUpiId] = useState(campaign.upi_id);
  const [paymentUrl, setPaymentUrl] = useState(campaign.payment_url);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [donations, rates] = await Promise.all([
        fetchAdminDonations(),
        getLiveRates()
      ]);
      setPendingList(donations.pending);
      setApprovedList(donations.approved);
      setRejectedList(donations.rejected);
      setCurrentFxRate(rates.INR);
      setCustomRate(rates.INR.toFixed(2));
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(text);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleApprove = async (donation: Donation) => {
    setActionLoadingId(donation.id);
    try {
      const rateToUse = parseFloat(customRate) || currentFxRate;
      const res = await approveDonationAction(donation, rateToUse);
      if (res.success) {
        await loadData();
        onRefreshCampaign();
      } else {
        alert('Failed to approve donation: ' + res.error);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject this payment submission?')) return;
    setActionLoadingId(id);
    try {
      const res = await rejectDonationAction(id);
      if (res.success) {
        await loadData();
        onRefreshCampaign();
      } else {
        alert('Failed to reject donation: ' + res.error);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSaved(false);

    try {
      const res = await updateCampaignSettings({
        campaign_status: campaignStatus,
        fundraising_enabled: fundraisingEnabled,
        purchase_status: purchaseStatus,
        purchase_proof_url: purchaseProofUrl,
        purchase_notes: purchaseNotes,
        upi_id: upiId,
        payment_url: paymentUrl,
      });

      if (res.success) {
        setSettingsSaved(true);
        onRefreshCampaign();
        setTimeout(() => setSettingsSaved(false), 3000);
      } else {
        alert('Failed to save settings: ' + res.error);
      }
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogoutClick = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('xiaomi_pad_8_mock_admin_session');
    onLogout();
  };

  return (
    <div className="py-8 animate-fade-in">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSite}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Return to site"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Admin Dashboard</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-normal">
                Verifications
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review incoming transactions, lock historical exchange rates, and manage campaign milestones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Refresh records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleLogoutClick}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 hover:border-red-800/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 mt-6 mb-6 overflow-x-auto pb-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Verifications</span>
          {pendingList.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-blue-600 text-[10px] font-bold flex items-center justify-center">
              {pendingList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('campaign')}
          className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'campaign'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Campaign Status</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit History ({approvedList.length + rejectedList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('setup')}
          className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'setup'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Setup Guide</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PENDING VERIFICATIONS                              */}
      {/* ========================================================= */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {/* Exchange Rate Helper Bar */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="text-zinc-300 font-medium">Exchange Rate Lock: </span>
                <span className="text-zinc-500">
                  Approved donations lock this conversion rate permanently.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="customRate" className="text-zinc-400 font-mono">1 USD = ₹</label>
              <input
                id="customRate"
                type="number"
                step="0.01"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
                className="w-20 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
              <span className="text-zinc-500 text-[10px]">(Live: {currentFxRate.toFixed(2)})</span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-zinc-500 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading pending verification requests...</span>
            </div>
          ) : pendingList.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">No pending transactions</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                All submitted payments have been verified. Any new submissions from supporters will appear here immediately.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingList.map((item) => {
                const isUpi = item.payment_method === 'upi';
                const nativeSymbol = item.native_currency === 'INR' ? '₹' : item.native_currency === 'USD' ? '$' : item.native_currency + ' ';
                const rateNum = parseFloat(customRate) || currentFxRate;
                
                // Preview locked conversion
                const previewConverted = item.native_currency === 'INR'
                  ? `~$${(item.native_amount / rateNum).toFixed(2)} USD`
                  : `~₹${Math.round(item.native_amount * rateNum).toLocaleString('en-IN')} INR`;

                return (
                  <div
                    key={item.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors shadow-sm"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Donation Info */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
                              isUpi
                                ? 'bg-blue-950/50 text-blue-400 border border-blue-500/25'
                                : 'bg-purple-950/50 text-purple-400 border border-purple-500/25'
                            }`}
                          >
                            {isUpi ? 'UPI Transfer' : 'International Gateway'}
                          </span>
                          <span className="text-sm font-bold font-mono text-white">
                            {nativeSymbol}{item.native_amount.toLocaleString()}
                          </span>
                          <span className="text-xs text-zinc-500 font-mono">
                            ({previewConverted})
                          </span>
                        </div>

                        {/* Transaction Reference Number (Prominent for Verification) */}
                        <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 max-w-fit">
                          <span className="text-[10px] uppercase font-mono text-zinc-500">Ref / UTR:</span>
                          <span className="text-xs font-mono font-bold text-zinc-100 select-all">
                            {item.payment_reference}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.payment_reference)}
                            className="text-zinc-500 hover:text-white p-0.5"
                            title="Copy Reference"
                          >
                            {copiedRef === item.payment_reference ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Donor metadata */}
                        <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>
                            Donor: <strong className="text-zinc-200">{item.display_name || 'Anonymous'}</strong>
                            {!item.show_name && <span className="text-zinc-500 ml-1">(Requested Anonymous)</span>}
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span>Submitted: {new Date(item.created_at).toLocaleString()}</span>
                        </div>

                        {item.message && (
                          <div className="text-xs text-zinc-400 italic bg-zinc-800/40 px-3 py-1.5 rounded-lg border border-zinc-800 max-w-xl">
                            "{item.message}"
                          </div>
                        )}
                      </div>

                      {/* Right: Approve & Reject Actions */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                        <button
                          type="button"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleApprove(item)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-xs font-medium text-white transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          {actionLoadingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          )}
                          <span>Approve & Lock Rate</span>
                        </button>

                        <button
                          type="button"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleReject(item.id)}
                          className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-red-950/40 text-xs font-medium text-zinc-400 hover:text-red-300 hover:border-red-800/40 border border-zinc-700 transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CAMPAIGN STATUS & SETTINGS                         */}
      {/* ========================================================= */}
      {activeTab === 'campaign' && (
        <div className="max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-7">
          <h2 className="text-base font-bold text-white mb-1">Campaign Configuration</h2>
          <p className="text-xs text-zinc-400 mb-6">
            Control crowdfunding lifecycle, toggle contribution intake, and record purchase status.
          </p>

          {settingsSaved && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* Campaign Status */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Campaign Lifecycle Status
              </label>
              <select
                value={campaignStatus}
                onChange={(e) => setCampaignStatus(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-medium transition-colors"
              >
                <option value="fundraising">Funding in Progress (Active)</option>
                <option value="goal_reached">Goal Reached 🎉 (Contributions Closed)</option>
                <option value="completed">Completed / Hardware Acquired</option>
                <option value="refunds">Refunds in Process</option>
                <option value="interest">Interest Phase</option>
              </select>
            </div>

            {/* Fundraising Active Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <div>
                <span className="text-xs font-medium text-zinc-200 block">Accept New Donations</span>
                <span className="text-[11px] text-zinc-500">
                  When disabled, donation buttons are deactivated on the public page.
                </span>
              </div>
              <input
                type="checkbox"
                checked={fundraisingEnabled}
                onChange={(e) => setFundraisingEnabled(e.target.checked)}
                className="w-5 h-5 rounded bg-zinc-900 border-zinc-700 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0 cursor-pointer"
              />
            </div>

            {/* Purchase Status */}
            <div className="pt-2 border-t border-zinc-800/80">
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Hardware Procurement Status
              </label>
              <select
                value={purchaseStatus}
                onChange={(e) => setPurchaseStatus(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="pending">Pending (Target not reached / not yet ordered)</option>
                <option value="ordered">Device Ordered (Awaiting shipment)</option>
                <option value="received">Device Received (In hands for ROM development)</option>
              </select>
            </div>

            {/* Proof URL */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Purchase Proof / Receipt URL <span className="text-zinc-500">(optional)</span>
              </label>
              <input
                type="url"
                value={purchaseProofUrl}
                onChange={(e) => setPurchaseProofUrl(e.target.value)}
                placeholder="https://example.com/receipt-or-photo.jpg"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 font-mono transition-colors"
              />
              <span className="text-[11px] text-zinc-500 block mt-1">
                Public link to official invoice, order receipt, or unboxing image.
              </span>
            </div>

            {/* Purchase Notes */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Dev Notes on Hardware Status <span className="text-zinc-500">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={purchaseNotes}
                onChange={(e) => setPurchaseNotes(e.target.value)}
                placeholder="e.g. Ordered Xiaomi Pad 8 12+256GB Cyan Blue + Pen from official Mi Store. Tracking number shared on Telegram."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 resize-none transition-colors"
              />
            </div>

            {/* Payment Details */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  UPI ID (VPA)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  International Payment Gateway URL
                </label>
                <input
                  type="url"
                  value={paymentUrl}
                  onChange={(e) => setPaymentUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-sm font-medium text-white transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {savingSettings ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Campaign Settings</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: AUDIT HISTORY                                      */}
      {/* ========================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">Verified & Rejected History</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Approved donations with locked historical conversion rates, alongside rejected submissions.
            </p>
          </div>

          <div className="space-y-3">
            {approvedList.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-medium text-[10px]">
                      Approved
                    </span>
                    <span className="font-semibold text-zinc-200">
                      {item.display_name}
                    </span>
                    <span className="text-zinc-500 font-mono">
                      (Ref: {item.payment_reference})
                    </span>
                  </div>
                  <div className="mt-1 text-zinc-500 font-mono">
                    Locked at approval: 1 USD = ₹{item.fx_rate?.toFixed(2) || 'N/A'} • Approved on{' '}
                    {item.approved_at ? new Date(item.approved_at).toLocaleString() : 'N/A'}
                  </div>
                </div>

                <div className="text-right sm:shrink-0 font-mono">
                  <div className="text-sm font-bold text-white">
                    {item.native_currency} {item.native_amount}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    ≈ ${item.usd_amount} / ₹{item.inr_amount}
                  </div>
                </div>
              </div>
            ))}

            {rejectedList.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs opacity-75"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-red-950/40 text-red-400 border border-red-500/20 font-medium text-[10px]">
                      Rejected
                    </span>
                    <span className="font-semibold text-zinc-300">
                      {item.display_name}
                    </span>
                    <span className="text-zinc-500 font-mono">
                      (Ref: {item.payment_reference})
                    </span>
                  </div>
                  <div className="mt-1 text-zinc-500">
                    Excluded from public tracker and totals
                  </div>
                </div>

                <div className="text-right sm:shrink-0 font-mono text-zinc-400">
                  {item.native_currency} {item.native_amount}
                </div>
              </div>
            ))}

            {approvedList.length === 0 && rejectedList.length === 0 && (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No historical records found yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SETUP GUIDE (Simple terms)                         */}
      {/* ========================================================= */}
      {activeTab === 'setup' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-3xl space-y-6 text-sm text-zinc-300">
          <div>
            <h2 className="text-lg font-bold text-white">Simple Backend Setup Guide (Supabase)</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Follow these 4 simple steps to connect your free database and create your admin password.
            </p>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-white">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">1</span>
                <span>Create a free Supabase project</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed pl-7">
                Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">supabase.com</a>, log in with GitHub, and click <strong>"New Project"</strong>. Give it any name (e.g. <code className="text-zinc-200">xiaomi-pad-8</code>) and choose a database password.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-white">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">2</span>
                <span>Run the SQL Database Script</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed pl-7">
                Inside your Supabase project dashboard:
                <br />1. Click the <strong>SQL Editor</strong> tab on the left sidebar.
                <br />2. Click <strong>"New query"</strong>.
                <br />3. Copy and paste the contents of <code className="text-zinc-200">supabase/schema.sql</code> into the query box and click <strong>"Run"</strong>.
                <br />This instantly creates the tables, security policies, and views.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-white">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">3</span>
                <span>Create your Admin User & Password</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed pl-7">
                1. In Supabase, click <strong>Authentication</strong> &gt; <strong>Users</strong>.
                <br />2. Click <strong>"Add user"</strong> &gt; <strong>"Create user"</strong>.
                <br />3. Enter your desired admin email and a strong password (e.g. your email and password to log in here).
                <br />4. Check <strong>"Auto Confirm User"</strong> so you can log in immediately without waiting for an email confirmation.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-white">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">4</span>
                <span>Copy your API Keys into .env / GitHub Secrets</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed pl-7">
                In Supabase, go to <strong>Project Settings</strong> (gear icon) &gt; <strong>API</strong>:
                <br />• Copy <strong>Project URL</strong> &rarr; <code className="text-zinc-200">VITE_SUPABASE_URL</code>
                <br />• Copy <strong>anon / public key</strong> &rarr; <code className="text-zinc-200">VITE_SUPABASE_ANON_KEY</code>
                <br />Add these to your local <code className="text-zinc-200">.env</code> file (or GitHub repository secrets for GitHub Actions deployment).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
