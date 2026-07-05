import React from "react";

/* ─── Section 1: Términos de Servicio ─── */
export const TerminosSection: React.FC<{ isRevealed: boolean; ICONS: Record<string, string> }> = ({ isRevealed, ICONS }) => (
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
);

/* ─── Section 2: Política de Privacidad ─── */
export const PrivacidadSection: React.FC<{ isRevealed: boolean; ICONS: Record<string, string> }> = ({ isRevealed, ICONS }) => (
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
);

/* ─── Section 3: Acuerdo de Procesamiento de Datos (DPA) ─── */
export const DpaSection: React.FC<{ isRevealed: boolean; ICONS: Record<string, string> }> = ({ isRevealed, ICONS }) => (
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
);

/* ─── Section 4: Acuerdo de Nivel de Servicio (SLA) ─── */
export const SlaSection: React.FC<{ isRevealed: boolean; ICONS: Record<string, string> }> = ({ isRevealed, ICONS }) => (
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
);
