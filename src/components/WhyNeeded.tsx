import React from "react";

export const WhyNeeded: React.FC = () => (
  <section
    id="development"
    className="site-container section-spacing section-divider"
  >
    <div className="section-heading">
      <p className="eyebrow">Development objectives</p>
      <h2>Hardware for development and testing</h2>
      <p className="muted">
        A physical device makes it possible to reproduce bugs and test fixes
        that an emulator can’t.
      </p>
    </div>
    <div className="purpose-grid">
      {[
        [
          "01",
          "Custom Android ROMs",
          "Build and test community Android software on the actual tablet.",
        ],
        [
          "02",
          "Kernel & hardware fixes",
          "Test display, audio, recovery, and device-specific changes.",
        ],
        [
          "03",
          "Pen & touch support",
          "Check stylus input, palm rejection, and latency with the official pen.",
        ],
      ].map(([number, title, description]) => (
        <div key={number} className="purpose-item">
          <span className="eyebrow">{number}</span>
          <h3>{title}</h3>
          <p className="muted text-sm leading-relaxed">{description}</p>
        </div>
      ))}
    </div>
  </section>
);
