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
  timer: "timer"
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

    const navLinks = document.querySelectorAll<HTMLAnchorElement>(".sidebar-bg a");
    navLinks.forEach((link) => {
      link.className =
        "group flex items-start gap-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg px-4 py-3 transition-all duration-200 font-body text-sm leading-snug";
      const icon = link.querySelector<HTMLElement>(".material-symbols-outlined");
      if (icon) icon.style.fontVariationSettings = "'FILL' 0";

      if (link.getAttribute("href") === `#${targetId}`) {
        link.className =
          "group flex items-start gap-3 text-primary bg-primary/10 font-semibold rounded-lg px-4 py-3 transition-all duration-200 font-body text-sm leading-snug ring-1 ring-primary/20";
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
            link.className =
              "group flex items-start gap-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg px-4 py-3 transition-all duration-200 font-body text-sm leading-snug";
            const icon = link.querySelector<HTMLElement>(".material-symbols-outlined");
            if (icon) icon.style.fontVariationSettings = "'FILL' 0";

            if (link.getAttribute("href") === `#${id}`) {
              link.className =
                "group flex items-start gap-3 text-primary bg-primary/10 font-semibold rounded-lg px-4 py-3 transition-all duration-200 font-body text-sm leading-snug ring-1 ring-primary/20";
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
      <LandingNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className={`w-full lg:col-span-3 fade-up stagger-1 ${isRevealed ? "is-visible" : ""}`}>
            <nav className="sidebar-bg rounded-xl p-4 sticky top-[88px] z-40 flex flex-row overflow-x-auto gap-3 border border-outline-variant/30 no-scrollbar lg:flex-col lg:p-6 lg:top-[100px] bg-surface-raised shadow-raised">
              <div className="mb-6 border-b border-outline-variant/30 pb-4 hidden lg:block">
                <h3 className="font-headline font-bold text-lg text-on-surface">Centro de Cumplimiento</h3>
                <p className="font-body text-sm text-on-surface-variant mt-1">v1.1.0 — Updated: 2026-06-22</p>
              </div>
              <a
                className="group flex items-start gap-3 text-primary bg-primary/10 font-semibold rounded-lg px-4 py-3 transition-all duration-200 font-body text-sm leading-snug ring-1 ring-primary/20"
                href="#terminos"
                onClick={(e) => handleSidebarClick(e, "terminos")}
              >
                <span className="material-symbols-outlined text-[20px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {ICONS.gavel}
                </span>
                Términos de Servicio
              </a>
              <a
                className="group flex items-start gap-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg px-4 py-3 transition-all duration-200 font-body text-sm leading-snug"
                href="#privacidad"
                onClick={(e) => handleSidebarClick(e, "privacidad")}
              >
                <span className="material-symbols-outlined text-[20px] mt-0.5" style={{ fontVariationSettings: "'FILL' 0" }}>
                  {ICONS.privacyTip}
                </span>
                Política de Privacidad
              </a>
              <a
                className="group flex items-start gap-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg px-4 py-3 transition-all duration-200 font-body text-sm leading-snug"
                href="#dpa"
                onClick={(e) => handleSidebarClick(e, "dpa")}
              >
                <span className="material-symbols-outlined text-[20px] mt-0.5" style={{ fontVariationSettings: "'FILL' 0" }}>
                  {ICONS.assignment}
                </span>
                Acuerdo de Procesamiento de Datos (DPA)
              </a>
              <a
                className="group flex items-start gap-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-lg px-4 py-3 transition-all duration-200 font-body text-sm leading-snug"
                href="#sla"
                onClick={(e) => handleSidebarClick(e, "sla")}
              >
                <span className="material-symbols-outlined text-[20px] mt-0.5" style={{ fontVariationSettings: "'FILL' 0" }}>
                  {ICONS.timer}
                </span>
                Acuerdo de Nivel de Servicio (SLA)
              </a>
              <div className="mt-8 pt-6 border-t border-outline-variant/30 flex-shrink-0 ml-auto lg:mt-8 lg:pt-6 lg:border-t lg:ml-0">
                <button className="w-full bg-surface border border-outline-variant text-on-surface hover:bg-surface-container hover:text-primary font-label text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-sm">{ICONS.download}</span>
                  Descargar PDF
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <main className="lg:col-span-9 max-w-[760px] px-2">
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
                  <h3 className="font-headline text-xl font-bold text-on-surface mb-3">6. Exclusiones</h3>
                  <p className="font-body text-on-surface-variant leading-relaxed mb-3">
                    Las siguientes interrupciones <strong>no</strong> contabilizarán en el cálculo del SLA del 99.2% de VeriFinca:
                  </p>
                  <ul className="space-y-3 font-body text-on-surface-variant pl-2">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>Eventos de fuerza mayor (desastres naturales, cortes de internet nacionales).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-1">{ICONS.fiberManualRecord}</span>
                      <span>Interrupciones o caídas de APIs de terceros (Registro Inmobiliario, DGII, TransUnion, servicios de Microsoft Azure a nivel regional).</span>
                    </li>
                  </ul>
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
            <h3 className="font-headline text-2xl font-bold mb-2">¿Necesita asistencia legal?</h3>
            <p className="font-body text-sm opacity-90 mb-1">
              Contáctenos para consultas sobre privacidad o términos de servicio.
            </p>
            <a className="font-body font-semibold hover:underline" href="mailto:legal@verifinca.do">
              legal@verifinca.do
            </a>
          </div>
          <div>
            <button className="bg-primary hover:bg-primary-hover text-on-primary font-label font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-raised whitespace-nowrap w-full md:w-auto active:scale-[0.98]">
              Contactar Soporte
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};
