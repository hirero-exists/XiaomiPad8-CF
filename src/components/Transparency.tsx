import React from "react";
import { CAMPAIGN_CONFIG } from "../config";

export const Transparency: React.FC = () => (
  <section className="site-container section-spacing section-divider faq-layout">
    <div className="section-heading">
      <p className="eyebrow">Verification and refunds</p>
      <h2>Campaign policies</h2>
    </div>
    <div className="faq-list">
      <details open>
        <summary>How does verification work?</summary>
        <p>
          Make your payment, then submit its transaction reference. The
          developer verifies payments manually. Approved contributions appear in
          the public total.
        </p>
      </details>
      <details>
        <summary>What appears on the public list?</summary>
        <p>
          The verified amount, payment method, date, optional message, and your
          chosen display name. You can choose to appear as Anonymous.
          Transaction references aren’t shown on the website.
        </p>
      </details>
      <details>
        <summary>Why are amounts shown in USD?</summary>
        <p>
          USD gives contributions from different countries one shared goal. INR
          equivalents are shown for convenience. Each approved payment keeps its
          saved exchange rate; the goal’s INR estimate uses the current rate.
        </p>
      </details>
      <details>
        <summary>What if the goal isn’t reached?</summary>
        <p>
          {CAMPAIGN_CONFIG.REFUND_POLICY.primary}{" "}
          {CAMPAIGN_CONFIG.REFUND_POLICY.upi}{" "}
          {CAMPAIGN_CONFIG.REFUND_POLICY.international}{" "}
          {CAMPAIGN_CONFIG.REFUND_POLICY.alternative}{" "}
          {CAMPAIGN_CONFIG.REFUND_POLICY.fees}
        </p>
        <p>{CAMPAIGN_CONFIG.REFUND_POLICY.assurance}</p>
      </details>
    </div>
  </section>
);
