import React from "react";
import { Link } from "react-router-dom";
import { LandingNav } from "../../../shared/components/layout/LandingNav";
import { LandingFooter } from "../../../shared/components/layout/LandingFooter";
import { BackToTopButton } from "../../../shared/components/ui/BackToTopButton";
import { BillingToggle } from "../components/BillingToggle";
import { PricingCards } from "../components/PricingCards";
import { FeatureComparisonTable } from "../components/FeatureComparisonTable";
import "./PricingPage.module.css";

const ICONS = {
  enhancedEncryption: "enhanced_encryption",
  gavel: "gavel",
  accountBalance: "account_balance",
};

interface PricingPageLayoutProps {
  isRevealed: boolean;
  isAnnual: boolean;
  setIsAnnual: (v: boolean) => void;
  prices: { profesional: string; empresa: string; corporativo: string };
  handleFreePlan: () => void;
  handlePaidPlan: (plan: "profesional" | "empresa" | "corporativo") => void;
}

export const PricingPageLayout: React.FC<PricingPageLayoutProps> = ({  isRevealed,
  isAnnual,
  setIsAnnual,
  prices,
  handleFreePlan,
  handlePaidPlan,
}) => {
  return (
    <div className="antialiased font-body min-h-screen flex flex-col bg-shimmer relative">
      {/* TopAppBar */}
      <LandingNav />

      <main className="flex-grow pt-20">
        {/* 1. Header Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center reveal-section">
          <span
            className={`inline-block text-secondary font-sans font-semibold text-[11px] tracking-widest mb-4 uppercase fade-up stagger-1 ${isRevealed ? "is-visible" : ""}`}
          >
            {"PLANES Y PRECIOS"}
          </span>
          <h1
            className={`text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-6 fade-up stagger-2 ${isRevealed ? "is-visible" : ""}`}
          >
            {"Elige el plan ideal para tu operación"}
          </h1>
          <p
            className={`text-lg text-on-surface-variant max-w-2xl mx-auto mb-10 font-body fade-up stagger-3 ${isRevealed ? "is-visible" : ""}`}
          >
            {"Escala tus validaciones inmobiliarias con planes diseñados para profesionales y empresas en la República Dominicana."}
          </p>

          <BillingToggle
            
            isRevealed={isRevealed}
            isAnnual={isAnnual}
            setIsAnnual={setIsAnnual}
          />
        </section>

        <PricingCards
          
          isRevealed={isRevealed}
          prices={prices}
          handleFreePlan={handleFreePlan}
          handlePaidPlan={handlePaidPlan}
        />

        <FeatureComparisonTable
          
          isRevealed={isRevealed}
        />

        {/* 4. Trust Strip */}
        <section
          className={`bg-surface-variant py-8 border-y border-outline-variant/50 reveal-section fade-up ${isRevealed ? "is-visible" : ""}`}
        >
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">
                {ICONS.enhancedEncryption}
              </span>
              <span className="font-headline font-semibold text-on-surface">
                {"Datos encriptados"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">
                {ICONS.gavel}
              </span>
              <span className="font-headline font-semibold text-on-surface">
                {"Cumplimiento Ley 172-13"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">
                {ICONS.accountBalance}
              </span>
              <span className="font-headline font-semibold text-on-surface">
                {"Integración DGII"}
              </span>
            </div>
          </div>
        </section>

        {/* 5. Bottom CTA Banner */}
        <section
          className={`bg-secondary text-on-secondary py-16 px-6 relative overflow-hidden reveal-section fade-up ${isRevealed ? "is-visible" : ""}`}
        >
          {/* Decorative pattern placeholder */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left md:w-2/3">
              <h2 className="text-3xl font-headline font-bold mb-3 text-white">
                {"¿Necesitas una solución corporativa a gran escala?"}
              </h2>
              <p className="font-body text-secondary-container opacity-90">
                {"Construimos infraestructuras de validación dedicadas para instituciones financieras y grandes firmas de abogados."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
              <a
                href="https://wa.link/oi1w9m"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary-hover text-on-primary font-label font-bold px-6 py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 btn-interact text-center"
              >
                {"Hablar con ventas"}
              </a>
              <Link
                to="/legal#billing"
                className="bg-transparent border border-outline-variant hover:bg-white/10 text-secondary-container text-on-secondary font-label font-medium px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 btn-interact text-center"
              >
                {"Ver documentación"}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Component from LandingFooter */}
      <LandingFooter />
      <BackToTopButton />
    </div>
  );
};
