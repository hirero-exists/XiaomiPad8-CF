import React from 'react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="border-t border-[var(--line)] py-10 bg-[#070709] text-xs font-mono text-[var(--muted)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-neutral-200 font-bold block mb-1">
            Xiaomi Pad 8 Community Development
          </span>
          <p className="text-[var(--muted)] max-w-md">
            Community-funded open-source development hardware. This project is independent and not affiliated with Xiaomi.
          </p>
        </div>

        <button
          onClick={onOpenAdmin}
          className="text-[var(--muted)] hover:text-white transition-colors"
        >
          [admin]
        </button>
      </div>
    </footer>
  );
};
