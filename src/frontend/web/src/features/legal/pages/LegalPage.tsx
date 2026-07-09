// react-doctor-disable no-giant-component
import React from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import { LandingNav } from "../../../shared/components/layout/LandingNav";
import { LandingFooter } from "../../../shared/components/layout/LandingFooter";
import { TerminosSection, PrivacidadSection, DpaSection, SlaSection } from "./LegalSections1";
import {
  MarcoLegalSection,
  BillingSection,
  RefundsSection,
  StripeProcessorSection,
  FinancialLiabilitySection,
  PaymentDataSection,
  AcceptableUseSection,
} from "./LegalSections2";

const ICONS = {
  gavel: "gavel",
  privacyTip: "privacy_tip",
  verifiedUser: "verified_user",
  database: "database",
  update: "update",
  fiberManualRecord: "fiber_manual_record",
  checkCircle: "check_circle",
  download: "download",
  assignment: "assignment",
  timer: "timer",
  menu_book: "menu_book",
  visibility: "visibility",
  payments: "payments",
  history: "history",
  security: "security"
};

export const LegalPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isRevealed, setIsRevealed] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string>("terminos");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef });

  const navItems = [
    { id: "terminos", icon: ICONS.gavel, label: "Términos de Servicio" },
    { id: "privacidad", icon: ICONS.privacyTip, label: "Política de Privacidad" },
    { id: "dpa", icon: ICONS.assignment, label: "Acuerdo de Procesamiento de Datos (DPA)" },
    { id: "sla", icon: ICONS.timer, label: "Acuerdo de Nivel de Servicio (SLA)" },
    { id: "marco-legal", icon: ICONS.menu_book, label: "Marco Normativo" },
    { id: "billing", icon: ICONS.payments, label: t('legal.billing.title', 'Facturación y Suscripciones') },
    { id: "refunds", icon: ICONS.history, label: t('legal.refunds.title', 'Política de Reembolsos') },
    { id: "stripeProcessor", icon: ICONS.security, label: t('legal.stripeProcessor.title', 'Procesador de Pagos') },
    { id: "financialLiability", icon: ICONS.gavel, label: t('legal.financialLiability.title', 'Responsabilidad Financiera') },
    { id: "paymentData", icon: ICONS.database, label: t('legal.paymentData.title', 'Datos de Pago') },
    { id: "acceptableUse", icon: ICONS.checkCircle, label: t('legal.acceptableUse.title', 'Uso Aceptable') },
  ];

  React.useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 50);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const rawHash = window.location.hash;
    const hashParts = rawHash.split("#");
    const elementId = hashParts[2];
    let timer: ReturnType<typeof setTimeout>;

    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    } else if (location.hash) {
      const elementIdClean = location.hash.replace("#", "");
      const element = document.getElementById(elementIdClean);
      if (element) {
        timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [location]);

  const handleSidebarClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.history.pushState(null, "", `#/legal#${targetId}`);
    setActiveSection(targetId);
  };

  React.useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("section[id]");

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -80% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          if (id) setActiveSection(id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const getNavLinkClasses = (id: string) => {
    const isActive = activeSection === id;
    const baseClasses = "group flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-200 font-body text-sm leading-snug w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500";

    if (isActive) {
      return `${baseClasses} text-orange-600 bg-orange-50 font-semibold ring-1 ring-orange-200`;
    }

    return `${baseClasses} text-slate-600 hover:text-slate-900 hover:bg-surface-container-low`;
  };

  return (
    <div className="font-body text-on-surface antialiased min-h-screen bg-neutral">
      <LandingNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className={`w-full fade-up stagger-1 ${isRevealed ? "is-visible" : ""} sticky top-[88px] lg:top-[100px] z-40 lg:col-span-3 lg:h-fit`}>
            <div className="relative w-full md:w-[320px] lg:w-full">
              <button type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between bg-surface/95 backdrop-blur-md border border-outline-variant/50 px-5 py-4 rounded-xl shadow-sm text-slate-900 font-semibold transition-all hover:bg-surface-container-low active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-orange-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {navItems.find(i => i.id === activeSection)?.icon || ICONS.menu_book}
                  </span>
                  {navItems.find(i => i.id === activeSection)?.label || "Navegación Legal"}
                </span>
                <span className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  {/* Invisible Overlay for clicking outside */}
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default"
                    aria-label="Cerrar menú"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-outline-variant/50 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="max-h-[60vh] overflow-y-auto p-2 flex flex-col gap-1">
                      {navItems.map(item => (
                        <button type="button"
                          key={item.id}
                          className={getNavLinkClasses(item.id)}
                          onClick={(e) => {
                            e.preventDefault();
                            setIsDropdownOpen(false);
                            handleSidebarClick(e as any, item.id);
                          }}
                        >
                          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeSection === item.id ? "'FILL' 1" : "'FILL' 0" }}>
                            {item.icon}
                          </span>
                          {item.label}
                        </button>
                      ))}
                      <div className="mt-2 pt-2 border-t border-outline-variant/30">
                        <button type="button"
                          onClick={() => { setIsDropdownOpen(false); handlePrint(); }}
                          className="w-full text-left group flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-200 font-body text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-surface-container-low"
                        >
                          <span className="material-symbols-outlined text-[20px]">{ICONS.download}</span>
                          Descargar PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main Content */}
          <main ref={contentRef} className="lg:col-span-9 min-w-0 w-full">
            {/* Header */}
            <div className={`mb-12 fade-up stagger-2 ${isRevealed ? "is-visible" : ""}`}>
              <span className="font-sans font-semibold text-[11px] tracking-widest uppercase text-secondary mb-2 block">
                LEGAL & COMPLIANCE
              </span>
              <h1 className="font-headline text-4xl md:text-5xl font-black text-on-surface mb-4 leading-tight">
                Documentación Legal
              </h1>
              <p className="font-body text-lg text-on-surface-variant mb-6 leading-relaxed max-w-[65ch]">
                Términos de servicio, políticas de privacidad y acuerdos de cumplimiento que rigen el uso de VeriFinca.
              </p>
              <div className="inline-flex items-center gap-2 bg-surface-raised px-3 py-1.5 rounded-full border border-outline-variant">
                <span className="material-symbols-outlined text-primary text-sm">{ICONS.update}</span>
                <span className="font-label text-sm font-medium text-on-surface-variant">
                  Última actualización: 22 de Junio, 2026
                </span>
              </div>
            </div>

            <TerminosSection isRevealed={isRevealed} ICONS={ICONS} />
            <PrivacidadSection isRevealed={isRevealed} ICONS={ICONS} />
            <DpaSection isRevealed={isRevealed} ICONS={ICONS} />
            <SlaSection isRevealed={isRevealed} ICONS={ICONS} />
            <MarcoLegalSection isRevealed={isRevealed} ICONS={ICONS} />
            <BillingSection t={t} ICONS={ICONS} />
            <RefundsSection t={t} ICONS={ICONS} />
            <StripeProcessorSection t={t} ICONS={ICONS} />
            <FinancialLiabilitySection t={t} ICONS={ICONS} />
            <PaymentDataSection t={t} ICONS={ICONS} />
            <AcceptableUseSection t={t} ICONS={ICONS} />
          </main>
        </div>
      </div>

      {/* Contact Strip */}
      <section className="bg-secondary w-full py-12 px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white text-center md:text-left">
            <h3 className="font-headline text-2xl font-bold mb-2">¿Necesita asistencia?</h3>
            <p className="font-body text-sm opacity-90 mb-1">
              Contáctenos para consultas sobre privacidad o términos de servicio.
            </p>
            <a className="font-body font-semibold hover:underline" href="mailto:legal@verifinca.do">
              legal@verifinca.do
            </a>
          </div>
          <div>
            <a
              href="https://wa.link/oi1w9m"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-center bg-primary hover:bg-primary-hover text-on-primary font-label font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-raised whitespace-nowrap w-full md:w-auto active:scale-[0.98]"
            >
              Contactar Soporte
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};
