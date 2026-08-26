import React from "react";

/* ─── Section 5: Marco Normativo de Referencia ─── */
export const MarcoLegalSection: React.FC<{ isRevealed: boolean; ICONS: Record<string, string> }> = ({ isRevealed, ICONS }) => (
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
);

/* ─── Section 6: Facturación y Suscripciones ─── */
export const BillingSection: React.FC<{ ICONS: Record<string, string> }> = ({ ICONS }) => (
  <section id="billing" className="scroll-mt-32 mt-16">
    <h2 className="font-headline text-2xl font-bold text-on-surface mb-6 pb-4 border-b border-outline-variant/50">
      Facturación y Suscripciones
    </h2>
    <div className="space-y-6">
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Planes de Suscripción
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
          VeriFinca ofrece planes mensuales y anuales, cobrados al inicio de cada ciclo de facturación.
        </p>
      </div>
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Métodos de Pago
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
          Aceptamos tarjetas de crédito y transferencias a través de Stripe de manera segura y tokenizada.
        </p>
      </div>
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Renovación Automática
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
          Las suscripciones se renuevan automáticamente, salvo cancelación previa al término del ciclo actual.
        </p>
      </div>
    </div>
  </section>
);

/* ─── Section 7: Reembolsos y Cancelaciones ─── */
export const RefundsSection: React.FC<{ ICONS: Record<string, string> }> = ({ ICONS }) => (
  <section id="refunds" className="scroll-mt-32 mt-16">
    <h2 className="font-headline text-2xl font-bold text-on-surface mb-6 pb-4 border-b border-outline-variant/50">
      Reembolsos y Cancelaciones
    </h2>
    <div className="space-y-6">
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Política de Reembolso
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
          No se efectuarán reembolsos por períodos parciales de uso o servicios no utilizados.
        </p>
      </div>
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Proceso de Cancelación
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
          El usuario puede cancelar la suscripción en cualquier momento a través de su panel de administración.
        </p>
      </div>
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Penalidad Anual
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px] p-4 bg-error-container/20 text-error rounded-lg border border-error/20">
          La cancelación anticipada de un plan anual conllevará una penalidad administrativa equivalente a 2 meses.
        </p>
      </div>
    </div>
  </section>
);

/* ─── Section 8: Procesador de Pagos y Seguridad (Stripe) ─── */
export const StripeProcessorSection: React.FC<{ ICONS: Record<string, string> }> = ({ ICONS }) => (
  <section id="stripeProcessor" className="scroll-mt-32 mt-16">
    <h2 className="font-headline text-2xl font-bold text-on-surface mb-6 pb-4 border-b border-outline-variant/50">
      Procesador de Pagos y Seguridad (Stripe)
    </h2>
    <p className="font-body text-on-surface-variant leading-relaxed mb-8">
      VeriFinca utiliza la pasarela de pagos Stripe para un procesamiento seguro y confiable.
    </p>
    <div className="space-y-6">
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Aceptación de Términos
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
          Al realizar transacciones, el usuario acepta de manera implícita los términos de servicio de Stripe.
        </p>
      </div>
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Cookies de Terceros
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
          Stripe puede requerir la utilización de cookies de seguridad para prevenir fraudes durante la transacción.
        </p>
      </div>
    </div>
  </section>
);

/* ─── Section 9: Responsabilidad Financiera ─── */
export const FinancialLiabilitySection: React.FC<{ ICONS: Record<string, string> }> = ({ ICONS }) => (
  <section id="financialLiability" className="scroll-mt-32 mt-16">
    <h2 className="font-headline text-2xl font-bold text-on-surface mb-6 pb-4 border-b border-outline-variant/50">
      Responsabilidad Financiera
    </h2>
    <div className="space-y-6">
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Cargos No Autorizados
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
          No nos responsabilizamos por cargos no autorizados originados por negligencia en el cuidado de sus credenciales.
        </p>
      </div>
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Disponibilidad del Servicio
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
          La pasarela de pago puede experimentar intermitencias fuera del control de VeriFinca.
        </p>
      </div>
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Límite de Responsabilidad
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
          En cualquier caso, la responsabilidad de VeriFinca se limita al equivalente de las suscripciones abonadas en el último año.
        </p>
      </div>
    </div>
  </section>
);

/* ─── Section 10: Tratamiento de Datos de Pago ─── */
export const PaymentDataSection: React.FC<{ ICONS: Record<string, string> }> = ({ ICONS }) => (
  <section id="paymentData" className="scroll-mt-32 mt-16">
    <h2 className="font-headline text-2xl font-bold text-on-surface mb-6 pb-4 border-b border-outline-variant/50">
      Tratamiento de Datos de Pago
    </h2>
    <div className="space-y-6">
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Tokenización de Tarjetas
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
          VeriFinca no almacena datos de tarjetas de crédito. Toda información es tokenizada por nuestro procesador de pago.
        </p>
      </div>
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Retención de Registros
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
          Conservamos historiales de facturación con fines legales y de auditoría contable.
        </p>
      </div>
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Historial de Transacciones
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
          Los usuarios registrados pueden consultar su historial de pagos directamente en el sistema.
        </p>
      </div>
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Notificación de Brechas
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
          Cualquier compromiso comprobado del procesador de pagos será notificado conforme a las normativas de seguridad de datos.
        </p>
      </div>
    </div>
  </section>
);

/* ─── Section 11: Uso Aceptable ─── */
export const AcceptableUseSection: React.FC<{ ICONS: Record<string, string> }> = ({ ICONS }) => (
  <section id="acceptableUse" className="scroll-mt-32 mt-16">
    <h2 className="font-headline text-2xl font-bold text-on-surface mb-6 pb-4 border-b border-outline-variant/50">
      Uso Aceptable
    </h2>
    <div className="space-y-6">
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Cuenta Personal e Intransferible
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
          Las cuentas registradas están diseñadas para uso exclusivo del titular, quedando estrictamente prohibida su cesión.
        </p>
      </div>
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Prohibición de Scraping (Ley 53-07)
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
          La extracción automatizada de los registros está sancionada por la legislación de protección de datos de la RD.
        </p>
      </div>
      <div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{ICONS.fiberManualRecord}</span>
          Suspensión Inmediata
        </h3>
        <p className="text-on-surface-variant font-body leading-relaxed text-[15px]">
          VeriFinca se reserva la potestad de inhabilitar aquellas cuentas que vulneren estas políticas de uso aceptable de manera flagrante.
        </p>
      </div>
    </div>
  </section>
);
