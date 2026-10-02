import React from 'react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="py-8 text-xs text-neutral-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="font-medium text-neutral-400 block mb-0.5">
            Xiaomi Pad 8 Community Development
          </span>
          <p className="text-neutral-500">
            Community-funded development hardware. This project is independent and is not affiliated with Xiaomi.
          </p>
        </div>

        <button
          onClick={onOpenAdmin}
          className="font-mono text-neutral-600 hover:text-neutral-400 transition-colors shrink-0"
        >
          admin
        </button>
      </div>
    </footer>
  );
};
