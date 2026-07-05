import React from "react";

interface BillingToggleProps {
  t: (key: string) => string;
  isRevealed: boolean;
  isAnnual: boolean;
  setIsAnnual: (v: boolean) => void;
}

export const BillingToggle: React.FC<BillingToggleProps> = ({
  t,
  isRevealed,
  isAnnual,
  setIsAnnual,
}) => {
  return (
    <div
      className={`inline-flex bg-surface-variant rounded-full p-1 border border-outline-variant/30 shadow-sm relative toggle-container fade-up stagger-3 ${isRevealed ? "is-visible" : ""} ${isAnnual ? "toggle-anual" : ""}`}
      id="billingToggle"
    >
      <div className="toggle-slider"></div>
      <button
        type="button"
        className={`px-6 py-2 rounded-full font-label font-semibold text-sm relative z-10 transition-colors duration-300 ${!isAnnual ? "text-primary font-bold" : "text-on-surface-variant"}`}
        onClick={() => setIsAnnual(false)}
      >
        {t("pricing.header.monthly")}
      </button>
      <button
        type="button"
        className={`px-6 py-2 rounded-full font-label font-semibold text-sm relative z-10 transition-colors duration-300 ${isAnnual ? "text-primary font-bold" : "text-on-surface-variant"}`}
        onClick={() => setIsAnnual(true)}
      >
        {t("pricing.header.yearly")}{" "}
        <span className="text-xs text-primary ml-1">-20%</span>
      </button>
    </div>
  );
};
