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
  HelpCircle,
  Loader2,
  RefreshCw,
  Lock
} from 'lucide-react';
import { Donation, CampaignData } from '../lib/types';
import {
  fetchAdminDonations,
  approveDonationAction,
  rejectDonationAction,
  updateCampaignSettings,
  supabase,
  isSupabaseConfigured
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
  const [activeTab, setActiveTab] = useState<'pending' | 'campaign' | 'history' | 'security' | 'setup'>('pending');

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

  // Security / Password update state
  const [adminEmail, setAdminEmail] = useState('forpayment169@gmail.com');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState('');
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

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

      // Get logged-in user email
      if (supabase && isSupabaseConfigured) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          setAdminEmail(user.email);
        }
      }
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
    if (!window.confirm('Reject this submission?')) return;
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

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setUpdatingPassword(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        // Mock preview
        setPasswordSuccess('Password updated successfully (preview mode).');
        setNewPassword('');
        setConfirmPassword('');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess('Password updated successfully! Use your new password on next login.');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordError('Failed to update password. Please try again.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);

    if (!newEmail.trim() || !newEmail.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setUpdatingEmail(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        setAdminEmail(newEmail.trim());
        setEmailSuccess('Email updated successfully (preview mode).');
        setNewEmail('');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        email: newEmail.trim(),
      });

      if (error) {
        setEmailError(error.message);
      } else {
        setEmailSuccess('Email update initiated. A confirmation link has been sent to your new email.');
        setNewEmail('');
      }
    } catch {
      setEmailError('Failed to update email. Please try again.');
    } finally {
      setUpdatingEmail(false);
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
    <div className="py-6 sm:py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSite}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Return to site"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-neutral-100 flex items-center gap-2">
              <span>Admin Dashboard</span>
              <span className="text-[11px] font-mono text-neutral-500 font-normal">
                ({pendingList.length} pending)
              </span>
            </h1>
            <p className="text-xs text-neutral-500 font-mono">
              Logged in as: <strong className="text-neutral-300">{adminEmail}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleLogoutClick}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>sign out</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 mt-5 mb-5 overflow-x-auto pb-1 text-xs font-mono">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'pending'
              ? 'bg-neutral-800 text-white'
              : 'bg-neutral-950 text-neutral-500 hover:text-neutral-300 border border-neutral-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending ({pendingList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('campaign')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'campaign'
              ? 'bg-neutral-800 text-white'
              : 'bg-neutral-950 text-neutral-500 hover:text-neutral-300 border border-neutral-800'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'history'
              ? 'bg-neutral-800 text-white'
              : 'bg-neutral-950 text-neutral-500 hover:text-neutral-300 border border-neutral-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History ({approvedList.length + rejectedList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'security'
              ? 'bg-neutral-800 text-white'
              : 'bg-neutral-950 text-neutral-500 hover:text-neutral-300 border border-neutral-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Account & Password</span>
        </button>

        <button
          onClick={() => setActiveTab('setup')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'setup'
              ? 'bg-neutral-800 text-white'
              : 'bg-neutral-950 text-neutral-500 hover:text-neutral-300 border border-neutral-800'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Hosting Guide</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* PENDING TAB                                               */}
      {/* ========================================================= */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {/* Rate Controller */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <span className="text-neutral-400">
              Lock Rate at Approval:
            </span>
            <div className="flex items-center gap-2">
              <label htmlFor="customRate" className="text-neutral-500">1 USD = ₹</label>
              <input
                id="customRate"
                type="number"
                step="0.01"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
                className="w-20 bg-neutral-950 border border-neutral-700 rounded px-2 py-0.5 text-white font-mono text-xs focus:outline-none"
              />
              <span className="text-neutral-600 text-[11px]">(Live: {currentFxRate.toFixed(2)})</span>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-neutral-500 text-xs font-mono flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Loading pending submissions...</span>
            </div>
          ) : pendingList.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-neutral-900/30 border border-neutral-800 text-neutral-500 text-xs font-mono">
              ✓ No pending submissions
            </div>
          ) : (
            <div className="space-y-3">
              {pendingList.map((item) => {
                const isUpi = item.payment_method === 'upi';
                const rateNum = parseFloat(customRate) || currentFxRate;
                
                // USD is main everywhere; bracketed native/INR
                const usdEst = item.native_currency === 'INR'
                  ? (item.native_amount / rateNum).toFixed(2)
                  : item.native_amount;
                
                const bracketText = item.native_currency === 'INR'
                  ? `(₹${item.native_amount.toLocaleString('en-IN')})`
                  : `(≈ ₹${Math.round(item.native_amount * rateNum).toLocaleString('en-IN')})`;

                return (
                  <div
                    key={item.id}
                    className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                            {isUpi ? 'UPI' : 'Card'}
                          </span>
                          <span className="text-sm font-bold font-mono text-neutral-100">
                            ${usdEst}
                          </span>
                          <span className="text-xs font-mono text-neutral-500">
                            {bracketText}
                          </span>
                        </div>

                        {/* Reference / UTR */}
                        <div className="flex items-center gap-1.5 text-xs font-mono bg-neutral-950 px-2.5 py-1 rounded border border-neutral-800/80 max-w-fit">
                          <span className="text-neutral-500 uppercase text-[10px]">Ref:</span>
                          <span className="text-neutral-200 font-semibold select-all">
                            {item.payment_reference}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.payment_reference)}
                            className="text-neutral-500 hover:text-white ml-1"
                            title="Copy Ref"
                          >
                            {copiedRef === item.payment_reference ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <div className="text-[11px] text-neutral-400 font-mono">
                          Backer: <strong className="text-neutral-200">{item.display_name || 'Anonymous'}</strong>
                          {!item.show_name && <span className="text-neutral-600 ml-1">(Requested anon)</span>}
                          <span className="text-neutral-600 ml-2">• {new Date(item.created_at).toLocaleString()}</span>
                        </div>

                        {item.message && (
                          <div className="text-xs text-neutral-400 italic">
                            "{item.message}"
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                        <button
                          type="button"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleApprove(item)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-xs font-mono font-medium text-white transition-colors flex items-center gap-1"
                        >
                          {actionLoadingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Approve & Lock</span>
                        </button>

                        <button
                          type="button"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleReject(item.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
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
      {/* CAMPAIGN SETTINGS TAB                                     */}
      {/* ========================================================= */}
      {activeTab === 'campaign' && (
        <div className="max-w-xl bg-neutral-900/60 border border-neutral-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-neutral-200 mb-4">Campaign Lifecycle</h2>

          {settingsSaved && (
            <div className="mb-4 p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300">
              ✓ Settings saved
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1 font-mono">Campaign Status</label>
              <select
                value={campaignStatus}
                onChange={(e) => setCampaignStatus(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 font-mono focus:outline-none"
              >
                <option value="fundraising">fundraising (active)</option>
                <option value="goal_reached">goal_reached (donations paused)</option>
                <option value="completed">completed (hardware received)</option>
                <option value="refunds">refunds (processing refunds)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-950 border border-neutral-800 font-mono">
              <span className="text-neutral-300">Accept New Contributions</span>
              <input
                type="checkbox"
                checked={fundraisingEnabled}
                onChange={(e) => setFundraisingEnabled(e.target.checked)}
                className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-blue-600 focus:ring-0"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-mono">Hardware Procurement Status</label>
              <select
                value={purchaseStatus}
                onChange={(e) => setPurchaseStatus(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 font-mono focus:outline-none"
              >
                <option value="pending">pending (not yet ordered)</option>
                <option value="ordered">ordered (awaiting delivery)</option>
                <option value="received">received (in hands for development)</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-mono">Purchase Proof / Receipt URL</label>
              <input
                type="url"
                value={purchaseProofUrl}
                onChange={(e) => setPurchaseProofUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-mono">Dev Hardware Notes</label>
              <textarea
                rows={2}
                value={purchaseNotes}
                onChange={(e) => setPurchaseNotes(e.target.value)}
                placeholder="Order details, tracking info, specs"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-mono">UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-mono">International Payment URL (ThankYouVeryMuch)</label>
              <input
                type="url"
                value={paymentUrl}
                onChange={(e) => setPaymentUrl(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 font-mono focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-xs font-mono font-medium text-white transition-colors"
            >
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* HISTORY TAB                                               */}
      {/* ========================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-2">
          {approvedList.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓ approved</span>
                  <span className="text-neutral-200 font-semibold">{item.display_name}</span>
                  <span className="text-neutral-600">Ref: {item.payment_reference}</span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  Locked rate: 1 USD = ₹{item.fx_rate?.toFixed(2) || 'N/A'} • {item.approved_at ? new Date(item.approved_at).toLocaleDateString() : ''}
                </div>
              </div>

              <div className="text-right sm:shrink-0 font-mono">
                <span className="text-neutral-100 font-semibold">${item.usd_amount}</span>
                <span className="text-neutral-500 ml-1.5">(≈ ₹{item.inr_amount})</span>
              </div>
            </div>
          ))}

          {rejectedList.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-900/20 border border-neutral-800/60 rounded-lg p-3 flex items-center justify-between text-xs font-mono opacity-60"
            >
              <div>
                <span className="text-red-400 mr-1.5">✕ rejected</span>
                <span className="text-neutral-400">{item.display_name}</span>
                <span className="text-neutral-600 ml-2">Ref: {item.payment_reference}</span>
              </div>
              <span className="text-neutral-500">{item.native_currency} {item.native_amount}</span>
            </div>
          ))}

          {approvedList.length === 0 && rejectedList.length === 0 && (
            <div className="p-6 text-center text-neutral-600 text-xs font-mono">
              No historical records
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECURITY / ACCOUNT MANAGEMENT TAB                         */}
      {/* ========================================================= */}
      {activeTab === 'security' && (
        <div className="max-w-xl space-y-6">
          {/* Change Password Card */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-neutral-100 mb-1 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-400" />
              <span>Change Admin Password</span>
            </h2>
            <p className="text-xs text-[var(--muted)] mb-4">
              Update your password. Takes effect immediately for your Supabase account.
            </p>

            {passwordSuccess && (
              <div className="mb-4 p-2.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300">
                ✓ {passwordSuccess}
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-2.5 rounded bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-300">
                ✕ {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-neutral-400 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                />
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-xs font-medium text-white transition-colors"
              >
                {updatingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Change Email Card */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-neutral-100 mb-1">
              Change Admin Email
            </h2>
            <p className="text-xs text-[var(--muted)] mb-4">
              Current email: <strong className="text-neutral-200">{adminEmail}</strong>
            </p>

            {emailSuccess && (
              <div className="mb-4 p-2.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300">
                ✓ {emailSuccess}
              </div>
            )}

            {emailError && (
              <div className="mb-4 p-2.5 rounded bg-red-950/40 border border-red-500/30 text-xs font-mono text-red-300">
                ✕ {emailError}
              </div>
            )}

            <form onSubmit={handleEmailUpdate} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-neutral-400 mb-1">New Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new-email@example.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                />
              </div>

              <button
                type="submit"
                disabled={updatingEmail}
                className="w-full py-2 px-4 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 text-xs font-medium text-neutral-200 transition-colors"
              >
                {updatingEmail ? 'Updating Email...' : 'Update Email'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* HOSTING GUIDE TAB                                         */}
      {/* ========================================================= */}
      {activeTab === 'setup' && (
        <div className="max-w-2xl bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 text-xs text-neutral-300 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-100">Hosting on GitHub Pages (Free)</h2>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
              <strong className="text-neutral-100 block mb-1">1. Push to GitHub</strong>
              <p className="text-neutral-400">
                Create a new repository on GitHub (e.g. <code className="text-neutral-200">xiaomi-pad-8-crowdfunding</code>) and push this folder:
                <br /><code className="text-neutral-200 select-all block mt-1 bg-neutral-900 p-1.5 rounded">git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git && git push -u origin main</code>
              </p>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
              <strong className="text-neutral-100 block mb-1">2. Enable GitHub Pages</strong>
              <p className="text-neutral-400">
                In your GitHub repo: Go to <strong>Settings</strong> &gt; <strong>Pages</strong>. Under <strong>Build and deployment &gt; Source</strong>, choose <strong>GitHub Actions</strong>.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
              <strong className="text-neutral-100 block mb-1">3. Add Supabase Secrets to GitHub</strong>
              <p className="text-neutral-400">
                In GitHub: Go to <strong>Settings</strong> &gt; <strong>Secrets and variables</strong> &gt; <strong>Actions</strong> &gt; <strong>New repository secret</strong>:
                <br />• <code className="text-neutral-200">VITE_SUPABASE_URL</code>: your Supabase Project URL
                <br />• <code className="text-neutral-200">VITE_SUPABASE_ANON_KEY</code>: your Supabase anon public key
              </p>
            </div>

            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
              <strong className="text-neutral-100 block mb-1">4. Automatic Deployment</strong>
              <p className="text-neutral-400">
                GitHub Actions will automatically run the build and publish your website to <code className="text-neutral-200">https://YOUR_USER.github.io/YOUR_REPO/</code>!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
