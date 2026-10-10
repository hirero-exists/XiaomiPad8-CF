import React from "react";
import { isSupabaseConfigured, isDesignPreview } from "../lib/supabase";

interface NavbarProps {
  currentView: "campaign" | "dashboard" | "admin";
  onNavigate: (view: "campaign" | "dashboard" | "admin") => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => (
  <header className="site-header">
    <div className="site-container nav-content">
      <button
        onClick={() => onNavigate("campaign")}
        className="brand"
        aria-label="Xiaomi Pad 8 campaign home"
      >
        <span className="brand-mark" aria-hidden="true">
          p8<span>.</span>
        </span>
        <span>
          Xiaomi Pad 8 <span className="brand-caption">Community fund</span>
        </span>
      </button>
      <nav aria-label="Primary" className="nav-links">
        <button
          onClick={() => onNavigate("campaign")}
          aria-current={currentView === "campaign" ? "page" : undefined}
        >
          Campaign
        </button>
        <button
          onClick={() => onNavigate("dashboard")}
          aria-current={currentView === "dashboard" ? "page" : undefined}
        >
          Contributions
        </button>
      </nav>
    </div>
    {!isSupabaseConfigured && (
      <div className="preview-notice">
        {isDesignPreview
          ? "Design preview · Sample data · Payments and administration disabled"
          : "Live data is unavailable"}
      </div>
    )}
  </header>
);
