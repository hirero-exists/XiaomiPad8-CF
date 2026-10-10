import React, { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  supabase,
  isSupabaseConfigured,
  isDesignPreview,
} from "../lib/supabase";

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToSite,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        setError("Administration requires a configured Supabase project.");
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: email.trim(),
          password: password,
        },
      );

      if (authError) {
        setError(authError.message || "Invalid credentials.");
      } else if (data.session) {
        onLoginSuccess();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-sm w-full">
        <button
          onClick={onBackToSite}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-neutral-300 mb-5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to campaign</span>
        </button>

        <div className="bg-[#121212] border border-neutral-800 rounded-xl p-5 sm:p-6 shadow-xl">
          <h1 className="text-lg font-bold text-neutral-100">
            Administrator sign in
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5 mb-5">
            Authenticate to review pending transactions.
          </p>

          {!isSupabaseConfigured && (
            <p className="mb-4 text-sm text-neutral-300 leading-relaxed">
              {isDesignPreview
                ? "Administration is disabled in the design preview."
                : "Administration is unavailable until Supabase is configured."}
            </p>
          )}

          {error && (
            <div className="mb-4 p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300">
              {error}
            </div>
          )}

          {isSupabaseConfigured && (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-neutral-400 mb-1 font-mono"
                >
                  Email
                </label>
                <input
                  id="admin-email"
                  autoComplete="username"
                  type="email"
                  required={isSupabaseConfigured}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-neutral-400 mb-1 font-mono"
                >
                  Password
                </label>
                <input
                  id="admin-password"
                  autoComplete="current-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-600 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-xs font-mono font-medium text-white transition-colors flex items-center justify-center gap-1.5 mt-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
