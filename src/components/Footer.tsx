import React from "react";

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => (
  <footer className="site-container site-footer">
    <div>
      <p className="text-sm font-medium">Xiaomi Pad 8 community development</p>
      <p className="muted text-xs mt-2">
        Independent open-source development. Not affiliated with Xiaomi.
      </p>
    </div>
    <button onClick={onOpenAdmin} className="text-link muted text-xs">
      Admin login
    </button>
  </footer>
);
