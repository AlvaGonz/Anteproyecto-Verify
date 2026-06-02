import React from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LandingNav } from "../../../shared/components/layout/LandingNav";
import { LandingFooter } from "../../../shared/components/layout/LandingFooter";

const ICONS = {
  gavel: "gavel",
  privacyTip: "privacy_tip",
  verifiedUser: "verified_user",
  database: "database",
  cookie: "cookie",
  warning: "warning",
  download: "download",
  update: "update",
  fiberManualRecord: "fiber_manual_record",
  checkCircle: "check_circle",
  visibility: "visibility",
  editDocument: "edit_document",
  deleteForever: "delete_forever",
};

export const LegalPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isRevealed, setIsRevealed] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 50);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const rawHash = window.location.hash; // e.g. "#/legal#terminos" or "#/legal"
    const hashParts = rawHash.split("#");
    const elementId = hashParts[2]; // if there is a second hash, like "terminos"

    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    } else if (location.hash) {
      const elementIdClean = location.hash.replace("#", "");
      const element = document.getElementById(elementIdClean);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    }
  }, [location]);

  const handleSidebarClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Update hash manually without trigger routing reload
    window.history.pushState(null, "", `#/legal#${targetId}`);

    // Manually trigger the observer active class updates
    const navLinks = document.querySelectorAll<HTMLAnchorElement>(".sidebar-bg a");
    navLinks.forEach((link) => {
      link.className =
        "flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest dark:hover:bg-surface-variant rounded-lg p-3 transition-all duration-150 scale-95 active:scale-100 font-body text-sm leading-relaxed whitespace-nowrap flex-shrink-0 px-4 py-2";
      const icon = link.querySelector<HTMLElement>(".material-symbols-outlined");
      if (icon) icon.style.fontVariationSettings = "'FILL' 0";

      if (link.getAttribute("href") === `#${targetId}`) {
        link.className =
          "flex items-center gap-3 bg-primary-container text-on-primary-container font-semibold rounded-lg p-3 transition-all duration-150 scale-95 active:scale-100 font-body text-sm leading-relaxed whitespace-nowrap flex-shrink-0 px-4 py-2";
        if (icon) icon.style.fontVariationSettings = "'FILL' 1";
      }
    });
  };

  React.useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("section[id]");
    const navLinks = document.querySelectorAll<HTMLAnchorElement>(".sidebar-bg a");

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -80% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");

          navLinks.forEach((link) => {
            // Reset styles
            link.className =
              "flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest dark:hover:bg-surface-variant rounded-lg p-3 transition-all duration-150 scale-95 active:scale-100 font-body text-sm leading-relaxed whitespace-nowrap flex-shrink-0 px-4 py-2";
            const icon = link.querySelector<HTMLElement>(".material-symbols-outlined");
            if (icon) icon.style.fontVariationSettings = "'FILL' 0";

            // Apply active styles
            if (link.getAttribute("href") === `#${id}`) {
              link.className =
                "flex items-center gap-3 bg-primary-container text-on-primary-container font-semibold rounded-lg p-3 transition-all duration-150 scale-95 active:scale-100 font-body text-sm leading-relaxed whitespace-nowrap flex-shrink-0 px-4 py-2";
              if (icon) icon.style.fontVariationSettings = "'FILL' 1";
            }
          });
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="font-body text-on-surface antialiased min-h-screen bg-neutral">
      {/* TopAppBar */}
      <LandingNav />

      {/* Main Grid Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className={`w-full lg:col-span-3 fade-up stagger-1 ${isRevealed ? "is-visible" : ""}`}>
            <nav className="sidebar-bg rounded-xl p-4 sticky top-[88px] z-40 flex flex-row overflow-x-auto gap-3 border border-outline-variant/30 no-scrollbar lg:flex-col lg:p-6 lg:top-[100px] bg-surface-raised shadow-raised">
              <div className="mb-6 border-b border-outline-variant/30 pb-4 hidden lg:block">
                <h3 className="font-headline font-bold text-lg text-on-surface">{t("legal.complianceCenter")}</h3>
                <p className="font-body text-sm text-on-surface-variant mt-1">{t("legal.complianceVersion")}</p>
              </div>
              <a
                className="flex items-center gap-3 bg-primary-container text-on-primary-container font-semibold rounded-lg p-3 transition-all duration-150 scale-95 active:scale-100 font-body text-sm leading-relaxed whitespace-nowrap flex-shrink-0 px-4 py-2"
                href="#terminos"
                onClick={(e) => handleSidebarClick(e, "terminos")}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {ICONS.gavel}
                </span>
                {t("legal.nav.terms")}
              </a>
              <a
                className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest dark:hover:bg-surface-variant rounded-lg p-3 transition-all duration-150 scale-95 active:scale-100 font-body text-sm leading-relaxed whitespace-nowrap flex-shrink-0 px-4 py-2"
                href="#privacidad"
                onClick={(e) => handleSidebarClick(e, "privacidad")}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                  {ICONS.privacyTip}
                </span>
                {t("legal.nav.privacy")}
              </a>
              <a
                className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest dark:hover:bg-surface-variant rounded-lg p-3 transition-all duration-150 scale-95 active:scale-100 font-body text-sm leading-relaxed whitespace-nowrap flex-shrink-0 px-4 py-2"
                href="#ley172"
                onClick={(e) => handleSidebarClick(e, "ley172")}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                  {ICONS.verifiedUser}
                </span>
                {t("legal.nav.ley172")}
              </a>
              <a
                className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest dark:hover:bg-surface-variant rounded-lg p-3 transition-all duration-150 scale-95 active:scale-100 font-body text-sm leading-relaxed whitespace-nowrap flex-shrink-0 px-4 py-2"
                href="#datos"
                onClick={(e) => handleSidebarClick(e, "datos")}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                  {ICONS.database}
                </span>
                {t("legal.nav.dataTreatment")}
              </a>
              <a
                className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest dark:hover:bg-surface-variant rounded-lg p-3 transition-all duration-150 scale-95 active:scale-100 font-body text-sm leading-relaxed whitespace-nowrap flex-shrink-0 px-4 py-2"
                href="#cookies"
                onClick={(e) => handleSidebarClick(e, "cookies")}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                  {ICONS.cookie}
                </span>
                {t("legal.nav.cookies")}
              </a>
              <a
                className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest dark:hover:bg-surface-variant rounded-lg p-3 transition-all duration-150 scale-95 active:scale-100 font-body text-sm leading-relaxed whitespace-nowrap flex-shrink-0 px-4 py-2"
                href="#descargo"
                onClick={(e) => handleSidebarClick(e, "descargo")}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                  {ICONS.warning}
                </span>
                {t("legal.nav.disclaimer")}
              </a>
              <div className="mt-8 pt-6 border-t border-outline-variant/30 flex-shrink-0 ml-auto lg:mt-8 lg:pt-6 lg:border-t lg:ml-0">
                <button className="w-full border border-secondary text-secondary font-label text-sm font-semibold py-2.5 px-4 rounded-lg hover:bg-secondary/5 transition-colors duration-200 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">{ICONS.download}</span>
                  {t("legal.nav.downloadPdf")}
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <main className="lg:col-span-9 max-w-[760px] px-2">
            {/* Header */}
            <div className={`mb-12 fade-up stagger-2 ${isRevealed ? "is-visible" : ""}`}>
              <span className="font-sans font-semibold text-[11px] tracking-widest uppercase text-secondary mb-2 block">
                {t("legal.header.tag")}
              </span>
              <h1 className="font-headline text-4xl md:text-5xl font-black text-on-surface mb-4 leading-tight">
                {t("legal.header.title")}
              </h1>
              <p className="font-body text-lg text-on-surface-variant mb-6 leading-relaxed">
                {t("legal.header.subtitle")}
              </p>
              <div className="inline-flex items-center gap-2 bg-surface-raised px-3 py-1.5 rounded-full border border-outline-variant">
                <span className="material-symbols-outlined text-primary text-sm">{ICONS.update}</span>
                <span className="font-label text-sm font-medium text-on-surface-variant">
                  {t("legal.header.lastUpdate")}
                </span>
              </div>
            </div>

            {/* Section 1: Terms */}
            <section className={`mb-16 scroll-mt-28 fade-up stagger-3 ${isRevealed ? "is-visible" : ""}`} id="terminos">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6 pb-2 border-b border-outline-variant/50">
                {t("legal.terms.title")}
              </h2>
              <div className="mb-8">
                <h3 className="font-headline text-xl font-bold text-on-surface mb-4">{t("legal.terms.scopeTitle")}</h3>
                <p className="font-body text-on-surface-variant leading-relaxed mb-4">
                  {t("legal.terms.scopeDesc")}
                </p>
              </div>
              <div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-4">{t("legal.terms.restrictTitle")}</h3>
                <ul className="space-y-3 font-body text-on-surface-variant">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                    <span>{t("legal.terms.restrictList.scraping")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                    <span>{t("legal.terms.restrictList.illegal")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                    <span>{t("legal.terms.restrictList.accounts")}</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 2: Privacy */}
            <section className={`mb-16 scroll-mt-28 fade-up stagger-4 ${isRevealed ? "is-visible" : ""}`} id="privacidad">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6 pb-2 border-b border-outline-variant/50">
                {t("legal.privacy.title")}
              </h2>
              <div className="bg-primary-subtle border-l-4 border-primary p-6 rounded-r-xl mb-8">
                <h3 className="font-headline text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">{ICONS.privacyTip}</span>
                  {t("legal.privacy.collectTitle")}
                </h3>
                <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                  {t("legal.privacy.collectDesc")}
                </p>
              </div>
              <div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-4">{t("legal.privacy.retentionTitle")}</h3>
                <p className="font-body text-on-surface-variant leading-relaxed">
                  {t("legal.privacy.retentionDesc")}
                </p>
              </div>
            </section>

            {/* Section 3: Ley 172-13 */}
            <section className={`mb-16 scroll-mt-28 fade-up stagger-5 ${isRevealed ? "is-visible" : ""}`} id="ley172">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6 pb-2 border-b border-outline-variant/50">
                {t("legal.ley172.title")}
              </h2>
              <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm mb-6">
                <div className="mb-6">
                  <h3 className="font-headline text-xl font-bold text-on-surface">{t("legal.ley172.statusTitle")}</h3>
                  <p className="font-body text-sm text-on-surface-variant mt-1">
                    {t("legal.ley172.statusSubtitle")}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 bg-surface-raised border border-outline-variant/50 p-4 rounded-lg">
                    <div className="bg-success/10 text-success p-2 rounded-full flex-shrink-0">
                      <span className="material-symbols-outlined">{ICONS.checkCircle}</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-on-surface text-sm">{t("legal.ley172.consent")}</h4>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">{t("legal.ley172.consentDesc")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-surface-raised border border-outline-variant/50 p-4 rounded-lg">
                    <div className="bg-success/10 text-success p-2 rounded-full flex-shrink-0">
                      <span className="material-symbols-outlined">{ICONS.checkCircle}</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-on-surface text-sm">{t("legal.ley172.purpose")}</h4>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">{t("legal.ley172.purposeDesc")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-surface-raised border border-outline-variant/50 p-4 rounded-lg">
                    <div className="bg-success/10 text-success p-2 rounded-full flex-shrink-0">
                      <span className="material-symbols-outlined">{ICONS.checkCircle}</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-on-surface text-sm">{t("legal.ley172.access")}</h4>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">
                        {t("legal.ley172.accessDesc")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-surface-raised border border-outline-variant/50 p-4 rounded-lg">
                    <div className="bg-success/10 text-success p-2 rounded-full flex-shrink-0">
                      <span className="material-symbols-outlined">{ICONS.checkCircle}</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-on-surface text-sm">{t("legal.ley172.purge")}</h4>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">
                        {t("legal.ley172.purgeDesc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="font-body text-sm text-on-surface-variant italic">
                {t("legal.ley172.footer")}
              </p>
            </section>

            {/* Section 4: Data Treatment */}
            <section className={`mb-16 scroll-mt-28 fade-up stagger-6 ${isRevealed ? "is-visible" : ""}`} id="datos">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6 pb-2 border-b border-outline-variant/50">
                {t("legal.dataTreatment.title")}
              </h2>
              <div className="mb-8">
                <h3 className="font-headline text-xl font-bold text-on-surface mb-3">{t("legal.dataTreatment.legalBaseTitle")}</h3>
                <p className="font-body text-on-surface-variant leading-relaxed">
                  {t("legal.dataTreatment.legalBaseDesc")}
                </p>
              </div>
              <div className="mb-8">
                <h3 className="font-headline text-xl font-bold text-on-surface mb-6">{t("legal.dataTreatment.rightsTitle")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  <div className="bg-surface border border-outline-variant p-5 rounded-xl shadow-sm text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-secondary">{ICONS.visibility}</span>
                    </div>
                    <h4 className="font-headline font-bold text-on-surface mb-2">{t("legal.dataTreatment.legalBaseTitle")}</h4>
                    <p className="font-body text-xs text-on-surface-variant">
                      {t("legal.dataTreatment.accessDesc")}
                    </p>
                  </div>
                  <div className="bg-surface border border-outline-variant p-5 rounded-xl shadow-sm text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-secondary">{ICONS.editDocument}</span>
                    </div>
                    <h4 className="font-headline font-bold text-on-surface mb-2">{t("legal.dataTreatment.rectifyTitle")}</h4>
                    <p className="font-body text-xs text-on-surface-variant">
                      {t("legal.dataTreatment.rectifyDesc")}
                    </p>
                  </div>
                  <div className="bg-surface border border-outline-variant p-5 rounded-xl shadow-sm text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-error">{ICONS.deleteForever}</span>
                    </div>
                    <h4 className="font-headline font-bold text-on-surface mb-2">{t("legal.dataTreatment.cancelTitle")}</h4>
                    <p className="font-body text-xs text-on-surface-variant">
                      {t("legal.dataTreatment.cancelDesc")}
                    </p>
                  </div>
                </div>
                <button className="border border-secondary text-secondary font-label font-bold py-2.5 px-6 rounded-lg hover:bg-secondary/5 transition-colors duration-200 w-full sm:w-auto">
                  {t("legal.dataTreatment.button")}
                </button>
              </div>
            </section>

            {/* Section 5: Cookies */}
            <section className={`mb-16 scroll-mt-28 fade-up stagger-7 ${isRevealed ? "is-visible" : ""}`} id="cookies">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6 pb-2 border-b border-outline-variant/50">
                {t("legal.cookies.title")}
              </h2>
              <p className="font-body text-on-surface-variant leading-relaxed mb-6">
                {t("legal.cookies.desc")}
              </p>
              <div className="overflow-x-auto rounded-xl border border-outline-variant shadow-sm">
                <table className="w-full text-left font-body text-sm">
                  <thead className="table-header-bg table-header-text font-headline bg-text-primary text-white">
                    <tr>
                      <th className="px-6 py-4 font-bold">{t("legal.cookies.table.name")}</th>
                      <th className="px-6 py-4 font-bold">{t("legal.cookies.table.purpose")}</th>
                      <th className="px-6 py-4 font-bold">{t("legal.cookies.table.duration")}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface divide-y divide-outline-variant/30 text-on-surface-variant">
                    <tr className="hover:bg-surface-container-low">
                      <td className="px-6 py-4 font-mono text-xs">session_token</td>
                      <td className="px-6 py-4">{t("legal.cookies.table.sessionTokenDesc")}</td>
                      <td className="px-6 py-4">{t("legal.cookies.table.session")}</td>
                    </tr>
                    <tr className="bg-surface-raised hover:bg-surface-container">
                      <td className="px-6 py-4 font-mono text-xs">csrf_token</td>
                      <td className="px-6 py-4">{t("legal.cookies.table.csrfTokenDesc")}</td>
                      <td className="px-6 py-4">{t("legal.cookies.table.session")}</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low">
                      <td className="px-6 py-4 font-mono text-xs">_ga</td>
                      <td className="px-6 py-4">{t("legal.cookies.table.gaDesc")}</td>
                      <td className="px-6 py-4">{t("legal.cookies.table.gaDuration")}</td>
                    </tr>
                    <tr className="bg-surface-raised hover:bg-surface-container">
                      <td className="px-6 py-4 font-mono text-xs">consent_record</td>
                      <td className="px-6 py-4">{t("legal.cookies.table.consentRecordDesc")}</td>
                      <td className="px-6 py-4">{t("legal.cookies.table.consentRecordDuration")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 6: Disclaimer */}
            <section className={`mb-16 scroll-mt-28 fade-up stagger-8 ${isRevealed ? "is-visible" : ""}`} id="descargo">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6 pb-2 border-b border-outline-variant/50">
                {t("legal.disclaimer.title")}
              </h2>
              <div className="bg-error/10 border-l-4 border-error p-6 rounded-r-xl">
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-error text-3xl flex-shrink-0">{ICONS.warning}</span>
                  <div>
                    <h3 className="font-headline text-lg font-bold text-error mb-2">
                      {t("legal.disclaimer.warrantyTitle")}
                    </h3>
                    <p className="font-body text-error/90 text-sm leading-relaxed">
                      {t("legal.disclaimer.warrantyDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Contact Strip */}
      <section className="bg-secondary w-full py-12 px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white text-center md:text-left">
            <h3 className="font-headline text-2xl font-bold mb-2">{t("legal.cta.title")}</h3>
            <p className="font-body text-sm opacity-90 mb-1">
              {t("legal.cta.subtitle")}
            </p>
            <a className="font-body font-semibold hover:underline" href="mailto:legal@verifinca.do">
              legal@verifinca.do
            </a>
          </div>
          <div>
            <button className="bg-primary hover:bg-primary-hover text-on-primary font-label font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-raised whitespace-nowrap w-full md:w-auto active:scale-[0.98]">
              {t("legal.cta.button")}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};
