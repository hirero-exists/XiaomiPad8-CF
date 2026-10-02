import React from 'react';
import { Send, Shield } from 'lucide-react';
import { CAMPAIGN_CONFIG } from '../config';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="py-12 border-t border-zinc-800/80 text-xs text-zinc-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="font-semibold text-zinc-300 block mb-1">
            Xiaomi Pad 8 Community Development
          </span>
          <p className="text-zinc-500 max-w-md leading-relaxed">
            Community-funded development hardware. This project is open-source, independent, and is not affiliated with Xiaomi Inc.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-4">
          {CAMPAIGN_CONFIG.GITHUB_URL && (
            <a
              href={CAMPAIGN_CONFIG.GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>
          )}
          {CAMPAIGN_CONFIG.TELEGRAM_GROUP_URL && (
            <a
              href={CAMPAIGN_CONFIG.TELEGRAM_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Group</span>
            </a>
          )}
          {CAMPAIGN_CONFIG.TELEGRAM_UPDATES_URL && (
            <a
              href={CAMPAIGN_CONFIG.TELEGRAM_UPDATES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Updates Channel</span>
            </a>
          )}
          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1 hover:text-zinc-300 transition-colors ml-2 pl-3 border-l border-zinc-800"
          >
            <Shield className="w-3.5 h-3.5 text-zinc-600" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
