import React from "react";
import { useLocation } from "react-router-dom";
import { LandingNav } from "../../public/components/LandingNav";
import { LandingFooter } from "../../public/components/LandingFooter";

export const LegalPage: React.FC = () => {
  const location = useLocation();

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
    <div className="font-body text-on-surface antialiased min-h-screen bg-[#DAD1C8]">
      {/* TopAppBar */}
      <LandingNav />

      {/* Main Grid Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="w-full lg:col-span-3">
            <nav className="sidebar-bg rounded-xl p-4 sticky top-[88px] z-40 flex flex-row overflow-x-auto gap-3 border border-outline-variant/30 no-scrollbar lg:flex-col lg:p-6 lg:top-[100px] bg-[#F4F1EC]">
              <div className="mb-6 border-b border-outline-variant/30 pb-4 hidden lg:block">
                <h3 className="font-headline font-bold text-lg text-on-surface">Compliance Center</h3>
                <p className="font-body text-sm text-on-surface-variant mt-1">v2.4 (RD Compliant)</p>
              </div>
              <a
                className="flex items-center gap-3 bg-primary-container text-on-primary-container font-semibold rounded-lg p-3 transition-all duration-150 scale-95 active:scale-100 font-body text-sm leading-relaxed whitespace-nowrap flex-shrink-0 px-4 py-2"
                href="#terminos"
                onClick={(e) => handleSidebarClick(e, "terminos")}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  gavel
                </span>
                Términos de Uso
              </a>
              <a
                className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest dark:hover:bg-surface-variant rounded-lg p-3 transition-all duration-150 scale-95 active:scale-100 font-body text-sm leading-relaxed whitespace-nowrap flex-shrink-0 px-4 py-2"
                href="#privacidad"
                onClick={(e) => handleSidebarClick(e, "privacidad")}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                  privacy_tip
                </span>
                Política de Privacidad
              </a>
              <a
                className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest dark:hover:bg-surface-variant rounded-lg p-3 transition-all duration-150 scale-95 active:scale-100 font-body text-sm leading-relaxed whitespace-nowrap flex-shrink-0 px-4 py-2"
                href="#ley172"
                onClick={(e) => handleSidebarClick(e, "ley172")}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                  verified_user
                </span>
                Ley 172-13
              </a>
              <a
                className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest dark:hover:bg-surface-variant rounded-lg p-3 transition-all duration-150 scale-95 active:scale-100 font-body text-sm leading-relaxed whitespace-nowrap flex-shrink-0 px-4 py-2"
                href="#datos"
                onClick={(e) => handleSidebarClick(e, "datos")}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                  database
                </span>
                Tratamiento de Datos
              </a>
              <a
                className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest dark:hover:bg-surface-variant rounded-lg p-3 transition-all duration-150 scale-95 active:scale-100 font-body text-sm leading-relaxed whitespace-nowrap flex-shrink-0 px-4 py-2"
                href="#cookies"
                onClick={(e) => handleSidebarClick(e, "cookies")}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                  cookie
                </span>
                Uso de Cookies
              </a>
              <a
                className="flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest dark:hover:bg-surface-variant rounded-lg p-3 transition-all duration-150 scale-95 active:scale-100 font-body text-sm leading-relaxed whitespace-nowrap flex-shrink-0 px-4 py-2"
                href="#descargo"
                onClick={(e) => handleSidebarClick(e, "descargo")}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                  warning
                </span>
                Descargos
              </a>
              <div className="mt-8 pt-6 border-t border-outline-variant/30 flex-shrink-0 ml-auto lg:mt-8 lg:pt-6 lg:border-t lg:ml-0">
                <button className="w-full border border-outline text-on-surface font-label text-sm font-semibold py-2 px-4 rounded-full hover:bg-surface-container-high transition-colors duration-200 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download PDF
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <main className="lg:col-span-9 max-w-[760px] px-2">
            {/* Header */}
            <div className="mb-12">
              <span className="font-label text-xs tracking-wider uppercase font-bold text-primary mb-2 block">
                MARCO LEGAL
              </span>
              <h1 className="font-headline text-4xl md:text-5xl font-black text-on-surface mb-4 leading-tight">
                Términos, Privacidad y Cumplimiento
              </h1>
              <p className="font-body text-lg text-on-surface-variant mb-6 leading-relaxed">
                Operamos bajo el marco legal de la República Dominicana, asegurando la transparencia y la protección de
                sus datos personales en cada transacción.
              </p>
              <div className="inline-flex items-center gap-2 bg-[#F4F1EC] px-3 py-1.5 rounded-full border border-outline-variant">
                <span className="material-symbols-outlined text-primary text-sm">update</span>
                <span className="font-label text-sm font-medium text-on-surface-variant">
                  Última actualización: Mayo 2026
                </span>
              </div>
            </div>

            {/* Section 1: Terms */}
            <section className="mb-16 scroll-mt-28" id="terminos">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6 pb-2 border-b border-outline-variant/50">
                Términos de Uso
              </h2>
              <div className="mb-8">
                <h3 className="font-headline text-xl font-bold text-on-surface mb-4">Alcance del servicio</h3>
                <p className="font-body text-on-surface-variant leading-relaxed mb-4">
                  VeriFinca proporciona herramientas para la verificación y gestión de propiedades inmobiliarias. El uso
                  de esta plataforma constituye la aceptación de estos términos en su totalidad. Los servicios
                  ofrecidos están diseñados para facilitar la debida diligencia, pero no reemplazan el asesoramiento
                  legal profesional.
                </p>
              </div>
              <div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-4">Restricciones de uso</h3>
                <ul className="space-y-3 font-body text-on-surface-variant">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-sm mt-1">fiber_manual_record</span>
                    <span>Prohibida la extracción automatizada de datos (scraping) sin autorización expresa.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-sm mt-1">fiber_manual_record</span>
                    <span>No se permite el uso de la plataforma para fines ilícitos o fraudulentos.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-sm mt-1">fiber_manual_record</span>
                    <span>
                      Las cuentas son personales e intransferibles; compartir credenciales resultará en suspensión
                      inmediata.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 2: Privacy */}
            <section className="mb-16 scroll-mt-28" id="privacidad">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6 pb-2 border-b border-outline-variant/50">
                Política de Privacidad
              </h2>
              <div className="bg-[#fcf2e9] border-l-4 border-primary-container p-6 rounded-r-xl mb-8">
                <h3 className="font-headline text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">info</span>
                  Datos que recopilamos
                </h3>
                <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                  Recopilamos información personal necesaria para la prestación del servicio, incluyendo: nombre
                  completo, cédula de identidad, información de contacto y datos relacionados con las propiedades
                  consultadas. Esta información se almacena de forma encriptada y segura.
                </p>
              </div>
              <div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-4">Retención de datos</h3>
                <p className="font-body text-on-surface-variant leading-relaxed">
                  De conformidad con la <strong className="text-on-surface">Ley 172-13</strong> sobre Protección de
                  Datos de Carácter Personal, los datos crediticios o de historial generados a través de consultas a
                  burós de crédito (ej. TransUnion) se retienen únicamente por el período establecido por la ley y se
                  purgan automáticamente una vez expirado dicho plazo o cuando se revoca el consentimiento del titular.
                </p>
              </div>
            </section>

            {/* Section 3: Ley 172-13 */}
            <section className="mb-16 scroll-mt-28" id="ley172">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6 pb-2 border-b border-outline-variant/50">
                Cumplimiento Ley 172-13
              </h2>
              <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm mb-6">
                <div className="mb-6">
                  <h3 className="font-headline text-xl font-bold text-on-surface">Estado de Cumplimiento</h3>
                  <p className="font-body text-sm text-on-surface-variant mt-1">
                    Métricas de alineación con el marco normativo dominicano.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 bg-surface-container-lowest border border-outline-variant/50 p-4 rounded-lg">
                    <div className="bg-green-100 text-green-700 p-2 rounded-full flex-shrink-0">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-on-surface text-sm">Consentimiento</h4>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">Captura explícita requerida.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-surface-container-lowest border border-outline-variant/50 p-4 rounded-lg">
                    <div className="bg-green-100 text-green-700 p-2 rounded-full flex-shrink-0">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-on-surface text-sm">Propósito</h4>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">Uso limitado al fin declarado.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-surface-container-lowest border border-outline-variant/50 p-4 rounded-lg">
                    <div className="bg-green-100 text-green-700 p-2 rounded-full flex-shrink-0">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-on-surface text-sm">Acceso</h4>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">
                        Derecho de consulta garantizado.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-surface-container-lowest border border-outline-variant/50 p-4 rounded-lg">
                    <div className="bg-green-100 text-green-700 p-2 rounded-full flex-shrink-0">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-on-surface text-sm">Purga</h4>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">
                        Eliminación tras período legal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="font-body text-sm text-on-surface-variant italic">
                * Plataforma registrada y certificada ante el Instituto Nacional de Protección de los Derechos del
                Consumidor (Pro Consumidor) y alineada con las normativas del INPD.
              </p>
            </section>

            {/* Section 4: Data Treatment */}
            <section className="mb-16 scroll-mt-28" id="datos">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6 pb-2 border-b border-outline-variant/50">
                Tratamiento de Datos
              </h2>
              <div className="mb-8">
                <h3 className="font-headline text-xl font-bold text-on-surface mb-3">Base legal</h3>
                <p className="font-body text-on-surface-variant leading-relaxed">
                  El tratamiento de sus datos se basa en el consentimiento libre, previo, expreso e informado, así como
                  en la necesidad contractual para la prestación de los servicios solicitados a VeriFinca.
                </p>
              </div>
              <div className="mb-8">
                <h3 className="font-headline text-xl font-bold text-on-surface mb-6">Derechos del titular</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  <div className="bg-surface border border-outline-variant p-5 rounded-xl shadow-sm text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-secondary">visibility</span>
                    </div>
                    <h4 className="font-headline font-bold text-on-surface mb-2">Acceso</h4>
                    <p className="font-body text-xs text-on-surface-variant">
                      Conocer qué datos suyos reposan en nuestras bases de datos.
                    </p>
                  </div>
                  <div className="bg-surface border border-outline-variant p-5 rounded-xl shadow-sm text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-secondary">edit_document</span>
                    </div>
                    <h4 className="font-headline font-bold text-on-surface mb-2">Rectificación</h4>
                    <p className="font-body text-xs text-on-surface-variant">
                      Actualizar o corregir información inexacta o desactualizada.
                    </p>
                  </div>
                  <div className="bg-surface border border-outline-variant p-5 rounded-xl shadow-sm text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-error">delete_forever</span>
                    </div>
                    <h4 className="font-headline font-bold text-on-surface mb-2">Cancelación</h4>
                    <p className="font-body text-xs text-on-surface-variant">
                      Solicitar la eliminación de sus datos cuando proceda legalmente.
                    </p>
                  </div>
                </div>
                <button className="border-2 border-primary text-primary font-label font-bold py-2.5 px-6 rounded-full hover:bg-primary hover:text-on-primary transition-colors duration-200 w-full sm:w-auto">
                  Ejercer mis derechos
                </button>
              </div>
            </section>

            {/* Section 5: Cookies */}
            <section className="mb-16 scroll-mt-28" id="cookies">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6 pb-2 border-b border-outline-variant/50">
                Uso de Cookies
              </h2>
              <p className="font-body text-on-surface-variant leading-relaxed mb-6">
                Utilizamos cookies estrictamente necesarias para el funcionamiento seguro de la plataforma, así como
                cookies analíticas para mejorar la experiencia del usuario. A continuación, detallamos las cookies
                principales utilizadas:
              </p>
              <div className="overflow-x-auto rounded-xl border border-outline-variant shadow-sm">
                <table className="w-full text-left font-body text-sm">
                  <thead className="table-header-bg table-header-text font-headline bg-[#111144] text-white">
                    <tr>
                      <th className="px-6 py-4 font-bold">Nombre</th>
                      <th className="px-6 py-4 font-bold">Propósito</th>
                      <th className="px-6 py-4 font-bold">Duración</th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface divide-y divide-outline-variant/30 text-on-surface-variant">
                    <tr className="hover:bg-surface-container-low">
                      <td className="px-6 py-4 font-mono text-xs">session_token</td>
                      <td className="px-6 py-4">Mantiene la sesión de usuario activa y segura.</td>
                      <td className="px-6 py-4">Sesión</td>
                    </tr>
                    <tr className="bg-[#F4F1EC] hover:bg-surface-container">
                      <td className="px-6 py-4 font-mono text-xs">csrf_token</td>
                      <td className="px-6 py-4">Previene ataques de falsificación de peticiones en sitios cruzados.</td>
                      <td className="px-6 py-4">Sesión</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low">
                      <td className="px-6 py-4 font-mono text-xs">_ga</td>
                      <td className="px-6 py-4">Analítica de uso de la plataforma (Google Analytics).</td>
                      <td className="px-6 py-4">2 años</td>
                    </tr>
                    <tr className="bg-[#F4F1EC] hover:bg-surface-container">
                      <td className="px-6 py-4 font-mono text-xs">consent_record</td>
                      <td className="px-6 py-4">Almacena las preferencias de privacidad del usuario.</td>
                      <td className="px-6 py-4">1 año</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 6: Disclaimer */}
            <section className="mb-16 scroll-mt-28" id="descargo">
              <h2 className="font-headline text-3xl font-bold text-on-surface mb-6 pb-2 border-b border-outline-variant/50">
                Descargo de Responsabilidad
              </h2>
              <div className="bg-[#FFEBEE] border-l-4 border-[#C62828] p-6 rounded-r-xl">
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-[#C62828] text-3xl flex-shrink-0">warning</span>
                  <div>
                    <h3 className="font-headline text-lg font-bold text-[#C62828] mb-2">
                      Limitación de Garantía Inmobiliaria
                    </h3>
                    <p className="font-body text-[#C62828] text-sm leading-relaxed">
                      La información proporcionada por VeriFinca sobre estados jurídicos de propiedades, cargas,
                      gravámenes o historiales de propietarios se basa en registros públicos y bases de datos de
                      terceros. Aunque nos esforzamos por mantener la precisión, VeriFinca no garantiza la exactitud
                      absoluta de estos datos ni asume responsabilidad por decisiones financieras, legales o
                      inmobiliarias tomadas exclusivamente basándose en los reportes de la plataforma. Se recomienda
                      siempre la verificación oficial ante la Jurisdicción Inmobiliaria y la consulta con un abogado
                      especializado.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Contact Strip */}
      <section className="bg-[#223382] w-full py-12 px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white text-center md:text-left">
            <h3 className="font-headline text-2xl font-bold mb-2">¿Tienes preguntas legales?</h3>
            <p className="font-body text-sm opacity-90 mb-1">
              Nuestro equipo de cumplimiento está disponible para aclarar cualquier duda.
            </p>
            <a className="font-body font-semibold hover:underline" href="mailto:legal@verifinca.do">
              legal@verifinca.do
            </a>
          </div>
          <div>
            <button className="bg-primary-container text-on-primary-container font-label font-bold py-3 px-8 rounded-full hover:bg-primary hover:text-on-primary transition-colors duration-200 shadow-lg whitespace-nowrap w-full md:w-auto">
              Enviar consulta legal
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};
