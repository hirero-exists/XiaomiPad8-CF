import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        // Mock preview login
        if (password.length > 0) {
          localStorage.setItem('xiaomi_pad_8_mock_admin_session', 'true');
          onLoginSuccess();
          return;
        } else {
          setError('Please enter a password.');
          return;
        }
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        setError(authError.message || 'Invalid credentials.');
      } else if (data.session) {
        onLoginSuccess();
      }
    } catch {
      setError('An unexpected login error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Back button */}
        <button
          onClick={onBackToSite}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to public website</span>
        </button>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
            <Lock className="w-5 h-5" />
          </div>

          <h1 className="text-xl font-bold text-white tracking-tight">
            Administrator Access
          </h1>
          <p className="text-xs text-zinc-400 mt-1 mb-6">
            Sign in with your Supabase admin credentials to verify transactions and manage campaign settings.
          </p>

          {!isSupabaseConfigured && (
            <div className="mb-5 p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-300">
              <span className="font-semibold block mb-0.5">ℹ️ Preview Environment:</span>
              Supabase credentials not yet detected in `.env`. You can test the admin dashboard by typing any password!
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required={isSupabaseConfigured}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-sm font-medium text-white transition-all flex items-center justify-center gap-2 shadow-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Log In</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-[11px] text-zinc-500 space-y-1">
            <span className="flex items-center gap-1 text-zinc-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Supabase Row-Level Security Enforced
            </span>
            <p>
              Private references and pending donations are strictly restricted to authenticated administrator sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
