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
      <div className="print:hidden">
        <LandingNav />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 print:pt-4 print:pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className={`w-full fade-up stagger-1 ${isRevealed ? "is-visible" : ""} print:hidden sticky top-[88px] lg:top-[100px] z-40 lg:col-span-3 lg:h-fit`}>
            <div className="mb-4 hidden lg:block">
              <h3 className="font-headline font-bold text-lg text-on-surface">{t('legal.complianceCenter', 'Centro de Cumplimiento')}</h3>
              <p className="font-body text-xs text-on-surface-variant mt-1">v1.1.0 — 2026-06-22</p>
            </div>
            <div className="relative w-full md:w-[320px] lg:w-full">
              <button 
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
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-outline-variant/50 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="max-h-[60vh] overflow-y-auto p-2 flex flex-col gap-1">
                      {navItems.map(item => (
                        <button
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
                        <button 
                          onClick={() => { window.print(); setIsDropdownOpen(false); }}
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
          <main className="lg:col-span-9 max-w-[760px] w-full print:col-span-12 print:max-w-none print:w-full print:px-0">
            {/* Header */}
            <div className={`mb-12 fade-up stagger-2 ${isRevealed ? "is-visible" : ""}`}>
              <span className="font-sans font-semibold text-[11px] tracking-widest uppercase text-secondary mb-2 block">
                LEGAL & COMPLIANCE
              </span>
              <h1 className="font-headline text-4xl md:text-5xl font-black text-on-surface mb-4 leading-tight">
                Documentación Legal
              </h1>
              <p className="font-body text-lg text-on-surface-variant mb-6 leading-relaxed">
                Términos de servicio, políticas de privacidad y acuerdos de cumplimiento que rigen el uso de VeriFinca.
              </p>
              <div className="inline-flex items-center gap-2 bg-surface-raised px-3 py-1.5 rounded-full border border-outline-variant">
                <span className="material-symbols-outlined text-primary text-sm">{ICONS.update}</span>
                <span className="font-label text-sm font-medium text-on-surface-variant">
                  Última actualización: 22 de Junio, 2026
                </span>
              </div>
            </div>

            {/* Section 1: Terms of Service */}
            <section className={`mb-16 scroll-mt-28 fade-up stagger-3 ${isRevealed ? "is-visible" : ""}`} id="terminos">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6 pb-2 border-b border-outline-variant/50">
                Términos de Servicio (Terms of Service)
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">1. Alcance del Servicio</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    VeriFinca es una plataforma de verificación inmobiliaria para la República Dominicana, diseñada para validar la integridad legal, financiera y documental de proyectos inmobiliarios.
                  </p>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">2. Sello de Integridad</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    El Sello de Integridad es emitido bajo las disposiciones de la <strong>Ley 126-02 (Art. 32)</strong>. Se genera mediante un certificado digital firmado criptográficamente, accesible vía código QR, otorgando equivalencia funcional a la firma manuscrita para propósitos de verificación.
                  </p>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-4">3. Conductas Prohibidas (Ley 53-07)</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed mb-3">
                    Cualquier intento de vulnerar la plataforma constituye un delito de Alta Tecnología conforme a la <strong>Ley 53-07</strong>. Esto incluye, pero no se limita a:
                  </p>
                  <ul className="space-y-3 font-body text-on-surface-variant pl-2">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span><em>Scraping</em> (extracción de datos) no autorizado.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>Intentos de inyección SQL (Art. 36 — DICAT).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>Evasión de autenticación de dos factores (2FA) y suplantación de identidad.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">4. Términos de Suscripción y Pagos</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    Los pagos de suscripción se procesan a través de <strong>Stripe</strong>, un proveedor certificado PCI Nivel 1 (PCI-DSS). VeriFinca no almacena directamente datos sensibles de tarjetas de crédito.
                  </p>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">5. Propiedad Intelectual</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    VeriFinca retiene la propiedad exclusiva sobre el algoritmo de emisión del Sello de Integridad, la generación de códigos QR, y el motor de análisis de OCR e Inteligencia Artificial utilizados en la plataforma.
                  </p>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">6. Limitación de Responsabilidad</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    La plataforma actúa exclusivamente como una herramienta de verificación documental y automatizada. <strong>No constituye un garante legal del título de propiedad</strong> ni reemplaza el debido proceso notarial y judicial.
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 p-6 rounded-r-xl">
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600 text-[22px]">
                      {ICONS.gavel}
                    </span>
                    6.1 Exoneración de Responsabilidad Financiera y Material (No-Intermediación)
                  </h3>
                  <p className="font-body text-on-surface-variant leading-relaxed mb-4">
                    <strong>VeriFinca es una plataforma tecnológica de análisis y cotejo documental automatizado.</strong> La emisión del Sello de Integridad Digital bajo la <strong>Ley 126-02</strong> certifica única y exclusivamente que la documentación legal, financiera y de propiedad cargada por el Desarrollador coincide con los registros públicos consultados en las APIs oficiales del Estado Dominicano al momento exacto de la consulta (<em>Tiempo T</em>).
                  </p>
                  <p className="font-body text-on-surface-variant font-semibold mb-3">VeriFinca <strong>NO</strong> garantiza, ni asume responsabilidad civil ni penal por:</p>
                  <ul className="space-y-3 font-body text-on-surface-variant text-sm pl-2">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-amber-500 text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>La veracidad material de los documentos analizados si estos fueron falsificados en origen con metodologías capaces de evadir los controles estándar de OCR e Inteligencia Artificial.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-amber-500 text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>El cese operativo, la insolvencia sobrevenida, la quiebra financiera o el incumplimiento de los tiempos de entrega del proyecto inmobiliario por parte del Desarrollador.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-amber-500 text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>Conflictos de linderos latentes, vicios ocultos de construcción, revocaciones posteriores de licencias municipales o ambientales no reflejadas en los sistemas públicos al momento de la consulta.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-amber-500 text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>El uso de VeriFinca constituye una herramienta de <strong>Debida Diligencia (Due Diligence)</strong> y no sustituye en ningún caso el asesoramiento legal independiente, notarial, ni las determinaciones definitivas de los <strong>Tribunales de Tierras de la República Dominicana</strong>.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">7. Ley Aplicable y Jurisdicción</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    Estos términos se rigen por las leyes de la República Dominicana. Cualquier disputa será sometida a la jurisdicción exclusiva de los Tribunales de la República Dominicana, en el Distrito Nacional, Santo Domingo.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Privacy Policy */}
            <section className={`mb-16 scroll-mt-28 fade-up stagger-4 ${isRevealed ? "is-visible" : ""}`} id="privacidad">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6 pb-2 border-b border-outline-variant/50">
                Política de Privacidad (Privacy Policy)
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-4">1. Datos que Recopilamos</h3>
                  <div className="overflow-x-auto rounded-xl border border-outline-variant shadow-sm mb-4">
                    <table className="w-full text-left font-body text-sm">
                      <thead className="bg-surface-variant/30 text-on-surface">
                        <tr>
                          <th className="px-6 py-4 font-bold border-b border-outline-variant/30">Categoría</th>
                          <th className="px-6 py-4 font-bold border-b border-outline-variant/30">Datos Específicos</th>
                          <th className="px-6 py-4 font-bold border-b border-outline-variant/30">Base Legal</th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface divide-y divide-outline-variant/30 text-on-surface-variant">
                        <tr className="hover:bg-surface-container-low">
                          <td className="px-6 py-4 font-semibold text-on-surface">Identidad</td>
                          <td className="px-6 py-4">Cédula Nacional / RNC (Tax ID)</td>
                          <td className="px-6 py-4">Ley 172-13 Art. 13, consentimiento informado</td>
                        </tr>
                        <tr className="bg-surface-raised hover:bg-surface-container">
                          <td className="px-6 py-4 font-semibold text-on-surface">Ubicación</td>
                          <td className="px-6 py-4">Coordenadas GPS, dirección del proyecto</td>
                          <td className="px-6 py-4">Contrato de servicios</td>
                        </tr>
                        <tr className="hover:bg-surface-container-low">
                          <td className="px-6 py-4 font-semibold text-on-surface">Financieros</td>
                          <td className="px-6 py-4">Historial crediticio del desarrollador (consulta a TransUnion con consentimiento expreso)</td>
                          <td className="px-6 py-4">Ley 172-13 Art. 8</td>
                        </tr>
                        <tr className="bg-surface-raised hover:bg-surface-container">
                          <td className="px-6 py-4 font-semibold text-on-surface">Documental</td>
                          <td className="px-6 py-4">PDFs subidos: títulos de propiedad, planos, permisos, cartas de ventas</td>
                          <td className="px-6 py-4">Ejecución del contrato</td>
                        </tr>
                        <tr className="hover:bg-surface-container-low">
                          <td className="px-6 py-4 font-semibold text-on-surface">Firma Digital</td>
                          <td className="px-6 py-4">Certificados emitidos bajo el Sello de Integridad QR</td>
                          <td className="px-6 py-4">Ley 126-02</td>
                        </tr>
                        <tr className="bg-surface-raised hover:bg-surface-container">
                          <td className="px-6 py-4 font-semibold text-on-surface">Biometría (Proxy)</td>
                          <td className="px-6 py-4">Documento de identidad gubernamental subido para validación</td>
                          <td className="px-6 py-4">Consentimiento explícito</td>
                        </tr>
                        <tr className="hover:bg-surface-container-low">
                          <td className="px-6 py-4 font-semibold text-on-surface">Uso/Analíticas</td>
                          <td className="px-6 py-4">Páginas vistas, duración de sesión, registros de errores</td>
                          <td className="px-6 py-4">Interés legítimo</td>
                        </tr>
                        <tr className="bg-surface-raised hover:bg-surface-container">
                          <td className="px-6 py-4 font-semibold text-on-surface">Pagos</td>
                          <td className="px-6 py-4">Últimos 4 dígitos de tarjeta, dirección de facturación (Stripe tokeniza los datos completos)</td>
                          <td className="px-6 py-4">Contrato (PCI-DSS Stripe Level 1)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-4">2. Cookies que Utilizamos</h3>
                  <div className="overflow-x-auto rounded-xl border border-outline-variant shadow-sm mb-4">
                    <table className="w-full text-left font-body text-sm">
                      <thead className="bg-surface-variant/30 text-on-surface">
                        <tr>
                          <th className="px-6 py-4 font-bold border-b border-outline-variant/30">Nombre</th>
                          <th className="px-6 py-4 font-bold border-b border-outline-variant/30">Tipo</th>
                          <th className="px-6 py-4 font-bold border-b border-outline-variant/30">Propósito</th>
                          <th className="px-6 py-4 font-bold border-b border-outline-variant/30">Duración</th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface divide-y divide-outline-variant/30 text-on-surface-variant">
                        <tr className="hover:bg-surface-container-low">
                          <td className="px-6 py-4 font-mono text-xs">vf_session</td>
                          <td className="px-6 py-4">Estrictamente Necesaria</td>
                          <td className="px-6 py-4">Token de sesión de autenticación (HttpOnly, Secure, SameSite=Strict)</td>
                          <td className="px-6 py-4">Sesión</td>
                        </tr>
                        <tr className="bg-surface-raised hover:bg-surface-container">
                          <td className="px-6 py-4 font-mono text-xs">vf_csrf</td>
                          <td className="px-6 py-4">Estrictamente Necesaria</td>
                          <td className="px-6 py-4">Protección contra CSRF</td>
                          <td className="px-6 py-4">Sesión</td>
                        </tr>
                        <tr className="hover:bg-surface-container-low">
                          <td className="px-6 py-4 font-mono text-xs">vf_consent</td>
                          <td className="px-6 py-4">Estrictamente Necesaria</td>
                          <td className="px-6 py-4">Registro de consentimiento de cookies</td>
                          <td className="px-6 py-4">12 meses</td>
                        </tr>
                        <tr className="bg-surface-raised hover:bg-surface-container">
                          <td className="px-6 py-4 font-mono text-xs">vf_lang</td>
                          <td className="px-6 py-4">Funcional</td>
                          <td className="px-6 py-4">Preferencia de idioma (es/en)</td>
                          <td className="px-6 py-4">12 meses</td>
                        </tr>
                        <tr className="hover:bg-surface-container-low">
                          <td className="px-6 py-4 font-mono text-xs">_analytics_id</td>
                          <td className="px-6 py-4">Analíticas (opt-in)</td>
                          <td className="px-6 py-4">Seguimiento agregado de uso (sin PII)</td>
                          <td className="px-6 py-4">6 meses</td>
                        </tr>
                        <tr className="bg-surface-raised hover:bg-surface-container">
                          <td className="px-6 py-4 font-mono text-xs">stripe_mid</td>
                          <td className="px-6 py-4">De terceros (Stripe)</td>
                          <td className="px-6 py-4">Prevención de fraude en pagos</td>
                          <td className="px-6 py-4">12 meses</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-primary-subtle border-l-4 border-primary p-6 rounded-r-xl">
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">{ICONS.visibility}</span>
                    3. Divulgación sobre Inteligencia Artificial / OCR
                  </h3>
                  <ul className="space-y-3 font-body text-on-surface-variant text-sm">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">{ICONS.fiberManualRecord}</span>
                      <span>VeriFinca utiliza un <strong>Motor de Reconocimiento Óptico de Caracteres (OCR)</strong> para extraer texto de los documentos PDF subidos (títulos de propiedad, permisos, declaraciones legales).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">{ICONS.fiberManualRecord}</span>
                      <span>Un <strong>modelo de clasificación de IA/Machine Learning</strong> analiza el texto extraído para detectar: campos obligatorios faltantes, fechas inconsistentes, firmas sospechosas e indicadores de alteración documental.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">{ICONS.fiberManualRecord}</span>
                      <span><strong>Ningún documento subido se comparte con proveedores de IA de terceros.</strong> El procesamiento ocurre exclusivamente en la infraestructura propia de VeriFinca (entorno de nube Microsoft Azure).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">{ICONS.fiberManualRecord}</span>
                      <span>El análisis de IA genera un puntaje de confianza y alertas. <strong>La decisión final de verificación es siempre supervisada por un ser humano</strong> (validador certificado de VeriFinca) antes de la emisión del Sello de Integridad.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">{ICONS.fiberManualRecord}</span>
                      <span>Los usuarios tienen derecho a solicitar la revisión humana de cualquier decisión impulsada por IA, conforme a la Ley 172-13 y el Art. 22 del GDPR.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-4">4. Notificación de Brechas de Seguridad</h3>
                  <ul className="space-y-3 font-body text-on-surface-variant pl-2">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>Bajo la normativa <strong>FTC Safeguards Rule 16 CFR Part 314.4(j)</strong>: VeriFinca notificará a la FTC de forma electrónica en un plazo <strong>no mayor a 30 días</strong> tras descubrir una brecha que involucre la información no encriptada de 500 o más consumidores.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>Los usuarios afectados serán notificados en un plazo máximo de <strong>72 horas</strong>, de conformidad con el Art. 33 del GDPR y las mejores prácticas internacionales.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-primary-subtle border-l-4 border-primary p-6 rounded-r-xl">
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">{ICONS.verifiedUser}</span>
                    5. Consentimiento Expreso para Consulta a Buró de Crédito (TransUnion — Ley 172-13)
                  </h3>
                  <p className="font-body text-on-surface-variant leading-relaxed mb-4">
                    Conforme al <strong>Artículo 8 de la Ley 172-13</strong> sobre Protección de Datos Personales, la consulta del historial crediticio de un Desarrollador ante <strong>TransUnion República Dominicana</strong> requiere un consentimiento que sea simultáneamente: <strong>previo, explícito, informado e individualmente revocable</strong>.
                  </p>
                  <ul className="space-y-3 font-body text-on-surface-variant text-sm pl-2 mb-4">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-sm mt-1">{ICONS.checkCircle}</span>
                      <span><strong>Flujo del Gestor de Consentimiento:</strong> El Desarrollador debe aceptar de forma expresa e individual un formulario de autorización específico para la consulta crediticia, separado de los Términos de Servicio generales, antes de que se inicie cualquier proceso de verificación financiera.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-sm mt-1">{ICONS.checkCircle}</span>
                      <span><strong>Alcance limitado de la consulta:</strong> La consulta a TransUnion se limita estrictamente a la verificación de la capacidad financiera para el proyecto declarado. El puntaje crediticio y el reporte en formato raw <strong>nunca se almacenan</strong> en las bases de datos de VeriFinca; solo se persiste el resultado booleano de la verificación (Aprobado / Observado) y la fecha de consulta.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-sm mt-1">{ICONS.checkCircle}</span>
                      <span><strong>Derecho de revocación:</strong> El Desarrollador puede revocar este consentimiento en cualquier momento desde el panel de su cuenta (Configuración → Privacidad → Revocar Acceso Crediticio). La revocación no tiene efecto retroactivo sobre las verificaciones ya completadas.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-sm mt-1">{ICONS.checkCircle}</span>
                      <span><strong>Prohibición de almacenamiento:</strong> Está técnica y contractualmente prohibido almacenar, replicar o transmitir a terceros los reportes de crédito completos emitidos por TransUnion. El incumplimiento constituye una infracción al <strong>Art. 25 de la Ley 172-13</strong> y podrá ser sancionado ante el Instituto Nacional de Protección de Datos (INPD) cuando este entre en funciones.</span>
                    </li>
                  </ul>
                  <p className="font-body text-xs text-on-surface-variant italic">
                    Para ejercer el derecho de acceso a los datos consultados ante TransUnion, el titular puede dirigirse directamente a: <strong>legal@verifinca.do</strong> indicando en el asunto "Solicitud Habeas Data — Reporte Crediticio".
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: DPA */}
            <section className={`mb-16 scroll-mt-28 fade-up stagger-5 ${isRevealed ? "is-visible" : ""}`} id="dpa">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6 pb-2 border-b border-outline-variant/50">
                Acuerdo de Procesamiento de Datos (DPA)
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">1. Estándares de Encriptación</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    All personal data is encrypted using AES-256 at rest and TLS 1.2 or higher in transit.
                  </p>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">2. Sub-Procesadores (Sub-Processors)</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed mb-3">
                    Para la prestación de los servicios, VeriFinca utiliza los siguientes sub-procesadores:
                  </p>
                  <ul className="space-y-3 font-body text-on-surface-variant pl-2">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span><strong>Microsoft Azure</strong>: Infraestructura, base de datos y procesamiento OCR/IA interno.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span><strong>Stripe Inc.</strong>: Procesamiento de pagos y tokenización de tarjetas.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span><strong>TransUnion</strong>: Buró de crédito (consultado exclusivamente con consentimiento expreso del usuario).</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">3. Registros de Auditoría (Audit Logs)</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    Los registros de auditoría de acceso, modificación y revisión de datos son retenidos por un mínimo de <strong>3 años</strong>.
                  </p>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">4. Procedimiento de Notificación de Brechas</h3>
                  <ul className="space-y-3 font-body text-on-surface-variant pl-2">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>Reporte electrónico obligatorio a la FTC en un plazo máximo de <strong>30 días</strong> desde el descubrimiento, en caso de afectar datos no encriptados de 500 o más consumidores (FTC Safeguards Rule 16 CFR Part 314.4j).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>Notificación a los sujetos de datos afectados en un plazo máximo de <strong>72 horas</strong>.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>Colaboración y notificación a las autoridades policiales competentes según el Art. 36 de la Ley 53-07.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">5. Retención de Datos</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    Los documentos y expedientes vinculados a proyectos inmobiliarios serán eliminados <strong>7 años</strong> después de la terminación del contrato, conforme a la legislación fiscal y comercial vigente en la República Dominicana.
                  </p>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">6. Derechos del Sujeto de Datos</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    Los usuarios tienen garantizados los derechos de acceso, rectificación y eliminación de sus datos, en virtud del recurso de <em>Habeas Data</em> establecido en la <strong>Ley 172-13</strong> y el <strong>Artículo 70 de la Constitución Dominicana</strong>.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: SLA */}
            <section className={`mb-16 scroll-mt-28 fade-up stagger-6 ${isRevealed ? "is-visible" : ""}`} id="sla">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6 pb-2 border-b border-outline-variant/50">
                Acuerdo de Nivel de Servicio (SLA)
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">1. Compromiso de Disponibilidad</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    VeriFinca se compromete a mantener una disponibilidad operativa (uptime) del <strong>99.2% mensual</strong>, lo que equivale a un máximo de 5.8 horas de inactividad planificada o imprevista por mes (RNF-3).
                  </p>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">2. Tiempos de Respuesta de Validación</h3>
                  <ul className="space-y-3 font-body text-on-surface-variant pl-2">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>Para validaciones de proyectos simples: <strong>≤ 2 minutos</strong>.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>Para proyectos complejos (múltiples documentos): <strong>≤ 5 minutos</strong> (RNF-2).</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">3. Capacidad Concurrente</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    La plataforma está diseñada y garantizada para soportar un mínimo de <strong>500 usuarios concurrentes</strong> realizando consultas o validaciones simultáneas (RNF-4).
                  </p>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">4. Mantenimiento Planificado</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    Cualquier ventana de mantenimiento planificado que pueda afectar la disponibilidad del sistema será notificada a los usuarios con al menos <strong>48 horas de anticipación</strong>, mediante avisos dentro de la aplicación (banners) y correo electrónico.
                  </p>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-4">5. Niveles de Respuesta ante Incidentes</h3>
                  <div className="overflow-x-auto rounded-xl border border-outline-variant shadow-sm mb-4">
                    <table className="w-full text-left font-body text-sm">
                      <thead className="bg-surface-variant/30 text-on-surface">
                        <tr>
                          <th className="px-6 py-4 font-bold border-b border-outline-variant/30">Severidad</th>
                          <th className="px-6 py-4 font-bold border-b border-outline-variant/30">Definición</th>
                          <th className="px-6 py-4 font-bold border-b border-outline-variant/30">Tiempo de Respuesta</th>
                          <th className="px-6 py-4 font-bold border-b border-outline-variant/30">Resolución Objetivo</th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface divide-y divide-outline-variant/30 text-on-surface-variant">
                        <tr className="hover:bg-surface-container-low">
                          <td className="px-6 py-4 font-semibold text-error">P1 — Crítico</td>
                          <td className="px-6 py-4">Caída total de la plataforma / brecha de datos</td>
                          <td className="px-6 py-4">≤ 1 hora</td>
                          <td className="px-6 py-4">≤ 4 horas</td>
                        </tr>
                        <tr className="bg-surface-raised hover:bg-surface-container">
                          <td className="px-6 py-4 font-semibold text-orange-600">P2 — Alto</td>
                          <td className="px-6 py-4">Función principal no disponible (OCR, Sello)</td>
                          <td className="px-6 py-4">≤ 4 horas</td>
                          <td className="px-6 py-4">≤ 24 horas</td>
                        </tr>
                        <tr className="hover:bg-surface-container-low">
                          <td className="px-6 py-4 font-semibold text-yellow-600">P3 — Medio</td>
                          <td className="px-6 py-4">Función secundaria degradada</td>
                          <td className="px-6 py-4">≤ 8 horas</td>
                          <td className="px-6 py-4">≤ 72 horas</td>
                        </tr>
                        <tr className="bg-surface-raised hover:bg-surface-container">
                          <td className="px-6 py-4 font-semibold text-blue-600">P4 — Bajo</td>
                          <td className="px-6 py-4">Fallo estético UI / error menor</td>
                          <td className="px-6 py-4">≤ 24 horas</td>
                          <td className="px-6 py-4">≤ 1 semana</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">6. Exclusiones del SLA y Modo Degradado Técnico</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed mb-4">
                    Las siguientes interrupciones <strong>no</strong> contabilizarán en el cálculo del SLA del 99.2% de VeriFinca, sin que ello dé lugar a créditos de consumo ni acciones de responsabilidad contractual:
                  </p>
                  <ul className="space-y-3 font-body text-on-surface-variant pl-2 mb-6">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>Eventos de fuerza mayor (desastres naturales, cortes de internet nacionales, actos de autoridad gubernamental).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span><strong>Caídas o degradación de APIs de organismos gubernamentales dominicanos</strong>: Registro Inmobiliario (RI), Dirección General de Impuestos Internos (DGII), Catastro Nacional, Ministerio de Medio Ambiente, o cualquier otro nodo del Estado.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>Interrupciones de sub-procesadores externos: TransUnion, Stripe, y Microsoft Azure a nivel de región de Azure.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>Mantenimiento planificado notificado con ≥ 48 horas de anticipación.</span>
                    </li>
                  </ul>

                  <div className="bg-surface-raised border border-outline-variant rounded-xl p-5">
                    <h4 className="font-headline text-base font-bold text-on-surface mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[18px]">{ICONS.timer}</span>
                      Protocolo de Modo Degradado Técnico (MDT)
                    </h4>
                    <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-3">
                      Cuando una o más APIs gubernamentales no estén disponibles, VeriFinca activará automáticamente el <strong>Modo Degradado Técnico (MDT)</strong>, bajo las siguientes condiciones:
                    </p>
                    <ul className="space-y-2 font-body text-sm text-on-surface-variant pl-2">
                      <li className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">{ICONS.checkCircle}</span>
                        <span>Las funciones de consulta y carga de documentos continuarán operativas. Los resultados de verificación que dependan del nodo gubernamental caído serán marcados con estado "<strong>Pendiente de Validación Oficial</strong>" y no como rechazados.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">{ICONS.checkCircle}</span>
                        <span>Se notificará al usuario mediante un banner en la interfaz identificando cuál servicio gubernamental específico está no disponible y el tiempo estimado de restauración, si lo hubiere.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">{ICONS.checkCircle}</span>
                        <span>El tiempo transcurrido en MDT por causa de indisponibilidad gubernamental <strong>no se computa</strong> contra el 99.2% de uptime ni activa compensaciones contractuales por créditos de consumo.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">{ICONS.checkCircle}</span>
                        <span>VeriFinca publicará un registro histórico de incidentes en MDT en el endpoint público <code className="font-mono text-xs bg-surface-container px-1.5 py-0.5 rounded">/health</code> de la plataforma.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Marco Normativo */}
            <section className={`mb-16 scroll-mt-28 fade-up stagger-7 ${isRevealed ? "is-visible" : ""}`} id="marco-legal">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6 pb-2 border-b border-outline-variant/50">
                Marco Normativo de Referencia
              </h2>
              <p className="font-body text-on-surface-variant leading-relaxed mb-8">
                La operación de VeriFinca está gobernada por el siguiente conjunto de leyes, reglamentos y estándares técnicos internacionales. Esta tabla es informativa y no exhaustiva.
              </p>

              <div className="space-y-6">
                {/* Local RD */}
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">{ICONS.menu_book}</span>
                    I. Marco Legal Local — República Dominicana
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-outline-variant shadow-sm">
                    <table className="w-full text-left font-body text-sm">
                      <thead className="bg-surface-variant/30 text-on-surface">
                        <tr>
                          <th className="px-5 py-4 font-bold border-b border-outline-variant/30">Norma</th>
                          <th className="px-5 py-4 font-bold border-b border-outline-variant/30">Aplicación en VeriFinca</th>
                          <th className="px-5 py-4 font-bold border-b border-outline-variant/30">Fuente</th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface divide-y divide-outline-variant/30 text-on-surface-variant">
                        <tr className="hover:bg-surface-container-low">
                          <td className="px-5 py-4 font-semibold text-on-surface">Ley 126-02</td>
                          <td className="px-5 py-4">Validez del Sello de Integridad, equivalencia funcional de firma digital, QR como documento electrónico.</td>
                          <td className="px-5 py-4 font-mono text-xs">Gaceta Oficial 10164 — 4 sep 2002. Decreto 335-03.</td>
                        </tr>
                        <tr className="bg-surface-raised hover:bg-surface-container">
                          <td className="px-5 py-4 font-semibold text-on-surface">Ley 53-07</td>
                          <td className="px-5 py-4">Marco penal para scraping ilegal, inyección SQL, suplantación de identidad y sabotaje informático.</td>
                          <td className="px-5 py-4 font-mono text-xs">Gaceta Oficial 10416 — 23 abr 2007.</td>
                        </tr>
                        <tr className="hover:bg-surface-container-low">
                          <td className="px-5 py-4 font-semibold text-on-surface">Ley 172-13</td>
                          <td className="px-5 py-4">Recolección y tratamiento de PII (Cédula, GPS, crédito). Consentimiento expreso para TransUnion. Habeas Data.</td>
                          <td className="px-5 py-4 font-mono text-xs">Gaceta Oficial 10737 — 13 dic 2013.</td>
                        </tr>
                        <tr className="bg-surface-raised hover:bg-surface-container">
                          <td className="px-5 py-4 font-semibold text-on-surface">Ley 155-17</td>
                          <td className="px-5 py-4">Obligaciones AML/CFT del sector inmobiliario. Due Diligence de promotores contra lavado de activos.</td>
                          <td className="px-5 py-4 font-mono text-xs">Gaceta Oficial 10884 — 1 jun 2017.</td>
                        </tr>
                        <tr className="hover:bg-surface-container-low">
                          <td className="px-5 py-4 font-semibold text-on-surface">Ley 358-05</td>
                          <td className="px-5 py-4">Transparencia en la prestación del servicio. Prohíbe publicidad engañosa sobre el alcance del Sello.</td>
                          <td className="px-5 py-4 font-mono text-xs">Gaceta Oficial 10336 — 9 sep 2005.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* International */}
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[20px]">{ICONS.menu_book}</span>
                    II. Marco Legal Internacional — Extraterritorialidad
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-outline-variant shadow-sm">
                    <table className="w-full text-left font-body text-sm">
                      <thead className="bg-surface-variant/30 text-on-surface">
                        <tr>
                          <th className="px-5 py-4 font-bold border-b border-outline-variant/30">Norma</th>
                          <th className="px-5 py-4 font-bold border-b border-outline-variant/30">Aplicación en VeriFinca</th>
                          <th className="px-5 py-4 font-bold border-b border-outline-variant/30">Jurisdicción</th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface divide-y divide-outline-variant/30 text-on-surface-variant">
                        <tr className="hover:bg-surface-container-low">
                          <td className="px-5 py-4 font-semibold text-on-surface">GDPR (UE) 2016/679</td>
                          <td className="px-5 py-4">Privacidad por diseño, notificación de brechas ≤ 72 h (Art. 33), revisión humana de decisiones IA (Art. 22). Solo aplica a ciudadanos UE.</td>
                          <td className="px-5 py-4 font-mono text-xs">Unión Europea</td>
                        </tr>
                        <tr className="bg-surface-raised hover:bg-surface-container">
                          <td className="px-5 py-4 font-semibold text-on-surface">FTC Safeguards Rule</td>
                          <td className="px-5 py-4">Salvaguardas técnicas para datos financieros de consumidores EE.UU. Reporte electrónico a FTC ≤ 30 días si ≥500 afectados. Solo aplica a ciudadanos EE.UU.</td>
                          <td className="px-5 py-4 font-mono text-xs">EE.UU. — 16 CFR Part 314</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Technical Standards */}
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.verifiedUser}</span>
                    III. Estándares Técnicos de Ciberseguridad
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-outline-variant shadow-sm">
                    <table className="w-full text-left font-body text-sm">
                      <thead className="bg-surface-variant/30 text-on-surface">
                        <tr>
                          <th className="px-5 py-4 font-bold border-b border-outline-variant/30">Estándar</th>
                          <th className="px-5 py-4 font-bold border-b border-outline-variant/30">Aplicación en VeriFinca</th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface divide-y divide-outline-variant/30 text-on-surface-variant">
                        <tr className="hover:bg-surface-container-low">
                          <td className="px-5 py-4 font-semibold text-on-surface">PCI-DSS v4.0</td>
                          <td className="px-5 py-4">Tokenización de pagos vía Stripe. SAQ-A: VeriFinca no almacena ni transmite PAN. Cifrado en tránsito TLS 1.2+.</td>
                        </tr>
                        <tr className="bg-surface-raised hover:bg-surface-container">
                          <td className="px-5 py-4 font-semibold text-on-surface">ISO/IEC 27001:2022</td>
                          <td className="px-5 py-4">SGSI para el backend Azure. Control A.5.34 (Privacidad y PII). Auditoría continua de accesos.</td>
                        </tr>
                        <tr className="hover:bg-surface-container-low">
                          <td className="px-5 py-4 font-semibold text-on-surface">CIS Controls v8</td>
                          <td className="px-5 py-4">Control 01 (Inventario de Activos), Control 07 (Gestión de Vulnerabilidades), Control 16 (Seguridad de Aplicaciones Web — OWASP).</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Facturación y Suscripciones */}
            <section id="billing" className="scroll-mt-32 mt-16">
              <h2 className="font-headline text-2xl font-bold text-on-surface mb-6 pb-4 border-b border-outline-variant/50">
                VI. {t('legal.billing.title', 'Política de Facturación y Suscripciones')}
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.billing.cycleTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
                    {t('legal.billing.cycleDesc')}
                  </p>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.billing.autoDebitTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
                    {t('legal.billing.autoDebitDesc')}
                  </p>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.billing.priceChangeTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
                    {t('legal.billing.priceChangeDesc')}
                  </p>
                </div>
              </div>
            </section>

            {/* 7. Reembolsos y Cancelaciones */}
            <section id="refunds" className="scroll-mt-32 mt-16">
              <h2 className="font-headline text-2xl font-bold text-on-surface mb-6 pb-4 border-b border-outline-variant/50">
                VII. {t('legal.refunds.title', 'Política de Reembolsos y Cancelaciones')}
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.refunds.finalTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
                    {t('legal.refunds.finalDesc')}
                  </p>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.refunds.cancelTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
                    {t('legal.refunds.cancelDesc')}
                  </p>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.refunds.annualPenaltyTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px] p-4 bg-error-container/20 text-error rounded-lg border border-error/20">
                    {t('legal.refunds.annualPenaltyDesc')}
                  </p>
                </div>
              </div>
            </section>

            {/* 8. Procesador de Pagos y Seguridad (Stripe) */}
            <section id="stripeProcessor" className="scroll-mt-32 mt-16">
              <h2 className="font-headline text-2xl font-bold text-on-surface mb-6 pb-4 border-b border-outline-variant/50">
                VIII. {t('legal.stripeProcessor.title', 'Procesador de Pagos y Seguridad (Stripe)')}
              </h2>
              <p className="font-body text-on-surface-variant leading-relaxed mb-8">
                {t('legal.stripeProcessor.desc')}
              </p>
              <div className="space-y-6">
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.stripeProcessor.acceptTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
                    {t('legal.stripeProcessor.acceptDesc')}
                  </p>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.stripeProcessor.cookiesTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
                    {t('legal.stripeProcessor.cookiesDesc')}
                  </p>
                </div>
              </div>
            </section>

            {/* 9. Responsabilidad Financiera */}
            <section id="financialLiability" className="scroll-mt-32 mt-16">
              <h2 className="font-headline text-2xl font-bold text-on-surface mb-6 pb-4 border-b border-outline-variant/50">
                IX. {t('legal.financialLiability.title', 'Responsabilidad Financiera')}
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.financialLiability.unauthorizedTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
                    {t('legal.financialLiability.unauthorizedDesc')}
                  </p>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.financialLiability.availabilityTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
                    {t('legal.financialLiability.availabilityDesc')}
                  </p>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.financialLiability.capTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
                    {t('legal.financialLiability.capDesc')}
                  </p>
                </div>
              </div>
            </section>

            {/* 10. Tratamiento de Datos de Pago */}
            <section id="paymentData" className="scroll-mt-32 mt-16">
              <h2 className="font-headline text-2xl font-bold text-on-surface mb-6 pb-4 border-b border-outline-variant/50">
                X. {t('legal.paymentData.title', 'Tratamiento de Datos de Pago')}
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.paymentData.tokenTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
                    {t('legal.paymentData.tokenDesc')}
                  </p>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.paymentData.retentionTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
                    {t('legal.paymentData.retentionDesc')}
                  </p>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.paymentData.historyTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
                    {t('legal.paymentData.historyDesc')}
                  </p>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.paymentData.breachTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
                    {t('legal.paymentData.breachDesc')}
                  </p>
                </div>
              </div>
            </section>

            {/* 11. Uso Aceptable de Pagos */}
            <section id="acceptableUse" className="scroll-mt-32 mt-16">
              <h2 className="font-headline text-2xl font-bold text-on-surface mb-6 pb-4 border-b border-outline-variant/50">
                XI. {t('legal.acceptableUse.title', 'Uso Aceptable')}
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.acceptableUse.nontransferTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
                    {t('legal.acceptableUse.nontransferDesc')}
                  </p>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.acceptableUse.scrapingTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
                    {t('legal.acceptableUse.scrapingDesc')}
                  </p>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
                    {t('legal.acceptableUse.suspensionTitle')}
                  </h3>
                  <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
                    {t('legal.acceptableUse.suspensionDesc')}
                  </p>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>

      {/* Contact Strip */}
      <section className="bg-secondary w-full py-12 px-4 sm:px-6 lg:px-8 mt-8 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white text-center md:text-left">
            <h3 className="font-headline text-2xl font-bold mb-2">¿Necesita asistencia legal?</h3>
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
      <div className="print:hidden">
        <LandingFooter />
      </div>
    </div>
  );
};
