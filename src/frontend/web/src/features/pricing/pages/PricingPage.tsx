import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LandingNav } from "../../../shared/components/layout/LandingNav";
import { LandingFooter } from "../../../shared/components/layout/LandingFooter";
import { useAuth } from "../../../shared/context/AuthContext";
import "./PricingPage.module.css";

export const PricingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const prices = {
    profesional: isAnnual ? "RD$2,800" : "RD$3,500",
    empresa: isAnnual ? "RD$8,000" : "RD$10,000",
    enterprise: isAnnual ? "RD$24,000" : "RD$30,000",
  };

  return (
    <div className="antialiased font-body min-h-screen flex flex-col bg-shimmer relative">
      {/* TopAppBar */}
      <LandingNav />

      <main className="flex-grow pt-20">
        {/* 1. Header Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center reveal-section">
          <span className={`inline-block text-secondary font-sans font-semibold text-[11px] tracking-widest mb-4 uppercase fade-up stagger-1 ${isRevealed ? "is-visible" : ""}`}>
            PLANES Y PRECIOS
          </span>
          <h1 className={`text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-6 fade-up stagger-2 ${isRevealed ? "is-visible" : ""}`}>
            Elige el plan ideal para tu operación
          </h1>
          <p className={`text-lg text-on-surface-variant max-w-2xl mx-auto mb-10 font-body fade-up stagger-3 ${isRevealed ? "is-visible" : ""}`}>
            Escala tus validaciones inmobiliarias con planes diseñados para profesionales y empresas en la República Dominicana.
          </p>

          {/* Billing Toggle */}
          <div
            className={`inline-flex bg-surface-variant rounded-full p-1 border border-outline-variant/30 shadow-sm relative toggle-container fade-up stagger-3 ${isRevealed ? "is-visible" : ""} ${isAnnual ? "toggle-anual" : ""}`}
            id="billingToggle"
          >
            <div className="toggle-slider"></div>
            <button
              className={`px-6 py-2 rounded-full font-label font-semibold text-sm relative z-10 transition-colors duration-300 ${!isAnnual ? "text-primary font-bold" : "text-on-surface-variant"}`}
              onClick={() => setIsAnnual(false)}
            >
              Mensual
            </button>
            <button
              className={`px-6 py-2 rounded-full font-label font-semibold text-sm relative z-10 transition-colors duration-300 ${isAnnual ? "text-primary font-bold" : "text-on-surface-variant"}`}
              onClick={() => setIsAnnual(true)}
            >
              Anual <span className="text-xs text-primary ml-1">-20%</span>
            </button>
          </div>
        </section>

        {/* 2. Pricing Grid */}
        <section className="max-w-7xl mx-auto px-6 pb-24 reveal-section">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Consulta */}
            <div className={`bg-surface rounded-xl p-8 border border-outline-variant/50 shadow-sm flex flex-col text-left card-enter card-stagger-1 hover:-translate-y-2 hover:shadow-lg transition-all duration-300 ${isRevealed ? "is-visible" : ""}`}>
              <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Consulta</h3>
              <div className="mb-6 flex items-baseline">
                <span className="text-3xl font-headline font-extrabold">$0</span>
                <span className="text-on-surface-variant font-body text-sm ml-2">/mes</span>
              </div>
              <p className="text-sm font-body text-on-surface-variant mb-8 flex-grow">
                Para usuarios ocasionales que necesitan consultas básicas de inmuebles.
              </p>
              <ul className="space-y-4 mb-8 font-body text-sm text-on-surface">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl check-anim check-delay-1">
                    check_circle
                  </span>
                  1 consultas /mes
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl check-anim check-delay-2">
                    check_circle
                  </span>
                  Datos públicos básicos
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <span className="material-symbols-outlined text-outline text-xl">cancel</span> Validación de identidad
                </li>
              </ul>
              <Link
                to="/register"
                className="w-full py-3 rounded-lg border border-secondary text-secondary font-label font-bold hover:bg-secondary/5 transition-colors btn-interact text-center block"
              >
                Comenzar gratis
              </Link>
            </div>

            {/* Card 2: Profesional (Featured) */}
            <div className={`bg-surface rounded-xl p-8 border-2 border-primary shadow-xl flex flex-col text-left relative transform md:-translate-y-4 card-enter card-stagger-2 hover:-translate-y-6 hover:shadow-2xl transition-all duration-300 z-10 ${isRevealed ? "is-visible" : ""}`}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-on-primary text-xs font-label font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm badge-pulse">
                MÁS POPULAR
              </div>
              <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Profesional</h3>
              <div className="mb-6 flex items-baseline">
                <span className="text-3xl font-headline font-extrabold text-primary">{prices.profesional}</span>
                <span className="text-on-surface-variant font-body text-sm ml-2">/mes</span>
              </div>
              <p className="text-sm font-body text-on-surface-variant mb-8 flex-grow">
                Herramientas completas para agentes independientes y pequeñas agencias.
              </p>
              <ul className="space-y-4 mb-8 font-body text-sm text-on-surface">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl fill-icon check-anim check-delay-1">
                    check_circle
                  </span>
                  25 consultas /mes
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl fill-icon check-anim check-delay-2">
                    check_circle
                  </span>
                  Reportes detallados PDF
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl fill-icon check-anim check-delay-3">
                    check_circle
                  </span>
                  Alertas de gravámenes
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl fill-icon check-anim check-delay-4">
                    check_circle
                  </span>
                  Soporte prioritario email
                </li>
              </ul>
              <Link
                to="/register?plan=profesional"
                className="w-full py-3 rounded-lg bg-primary text-on-primary font-label font-bold hover:bg-primary-hover shadow-md transition-colors btn-interact text-center block"
              >
                Elegir Profesional
              </Link>
            </div>

            {/* Card 3: Empresa */}
            <div className={`bg-surface rounded-xl p-8 border border-outline-variant/50 shadow-sm flex flex-col text-left card-enter card-stagger-3 hover:-translate-y-2 hover:shadow-lg transition-all duration-300 ${isRevealed ? "is-visible" : ""}`}>
              <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Empresa</h3>
              <div className="mb-6 flex items-baseline">
                <span className="text-3xl font-headline font-extrabold text-secondary">{prices.empresa}</span>
                <span className="text-on-surface-variant font-body text-sm ml-2">/mes</span>
              </div>
              <p className="text-sm font-body text-on-surface-variant mb-8 flex-grow">
                Volumen alto para inmobiliarias y equipos de analistas.
              </p>
              <ul className="space-y-4 mb-8 font-body text-sm text-on-surface">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl check-anim check-delay-1">
                    check_circle
                  </span>
                  100 consultas /mes
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl check-anim check-delay-2">
                    check_circle
                  </span>
                  Multiusuario (hasta 5)
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl check-anim check-delay-3">
                    check_circle
                  </span>
                  API básica
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl check-anim check-delay-4">
                    check_circle
                  </span>
                  Integración CRM
                </li>
              </ul>
              <Link
                to="/register?plan=empresa"
                className="w-full py-3 rounded-lg border border-secondary text-secondary font-label font-bold hover:bg-secondary/5 transition-colors btn-interact text-center block"
              >
                Elegir Empresa
              </Link>
            </div>

            {/* Card 4: Enterprise */}
            <div className={`bg-surface rounded-xl p-8 border border-outline-variant/50 shadow-sm flex flex-col text-left card-enter card-stagger-4 hover:-translate-y-2 hover:shadow-lg transition-all duration-300 ${isRevealed ? "is-visible" : ""}`}>
              <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Enterprise</h3>
              <div className="mb-6 flex items-baseline">
                <span className="text-3xl font-headline font-extrabold text-on-surface">{prices.enterprise}</span>
                <span className="text-on-surface-variant font-body text-sm ml-2">/mes</span>
              </div>
              <p className="text-sm font-body text-on-surface-variant mb-8 flex-grow">
                Soluciones a medida para bancos, desarrolladoras y gobierno.
              </p>
              <ul className="space-y-4 mb-8 font-body text-sm text-on-surface">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-on-surface text-xl check-anim check-delay-1">
                    check_circle
                  </span>
                  Consultas ilimitadas
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-on-surface text-xl check-anim check-delay-2">
                    check_circle
                  </span>
                  API Full Access
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-on-surface text-xl check-anim check-delay-3">
                    check_circle
                  </span>
                  Validaciones en lote
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-on-surface text-xl check-anim check-delay-4">
                    check_circle
                  </span>
                  SLA garantizado 99.9%
                </li>
              </ul>
              <Link
                to={isAuthenticated ? "/contacto" : "/register?plan=enterprise"}
                className="w-full py-3 rounded-lg bg-secondary text-on-secondary font-label font-bold hover:bg-secondary/90 transition-colors btn-interact text-center block text-secondary-container"
              >
                Contactar Ventas
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Feature Comparison Table */}
        <section className={`max-w-7xl mx-auto px-6 pb-24 hidden md:block reveal-section fade-up ${isRevealed ? "is-visible" : ""}`}>
          <h2 className="text-3xl font-headline font-bold text-center mb-12">Comparativa detallada</h2>
          <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface">
                  <th className="py-4 px-6 font-headline font-bold text-on-surface w-1/5 border-b border-outline-variant">
                    Características
                  </th>
                  <th className="py-4 px-6 font-label font-semibold text-center text-on-surface w-1/5 border-b border-outline-variant">
                    Consulta
                  </th>
                  <th className="py-4 px-6 font-label font-bold text-center text-on-surface bg-primary/5 w-1/5 border-b-2 border-primary">
                    <span className="inline-block relative">
                      Profesional
                      <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-primary rounded-full"></span>
                    </span>
                  </th>
                  <th className="py-4 px-6 font-label font-semibold text-center text-secondary w-1/5 border-b border-outline-variant">
                    Empresa
                  </th>
                  <th className="py-4 px-6 font-label font-semibold text-center text-on-surface w-1/5 border-b border-outline-variant">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="font-body text-sm">
                {/* Group: Capacidad */}
                <tr className="bg-surface-variant">
                  <td
                    className="py-2 px-6 font-bold text-on-surface-variant uppercase text-xs tracking-wider"
                    colSpan={5}
                  >
                    Capacidad de Búsqueda
                  </td>
                </tr>
                <tr className="bg-surface border-b border-outline-variant/30">
                  <td className="py-3 px-6 text-on-surface">Límite mensual</td>
                  <td className="py-3 px-6 text-center text-on-surface-variant">1</td>
                  <td className="py-3 px-6 text-center font-bold text-primary bg-primary/5">25</td>
                  <td className="py-3 px-6 text-center text-on-surface-variant">100</td>
                  <td className="py-3 px-6 text-center text-on-surface-variant">Ilimitado</td>
                </tr>
                <tr className="bg-surface-variant border-b border-outline-variant/30">
                  <td className="py-3 px-6 text-on-surface">Histórico de títulos</td>
                  <td className="py-3 px-6 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-outline text-sm">close</span>
                  </td>
                  <td className="py-3 px-6 text-center text-primary bg-primary/5">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </td>
                  <td className="py-3 px-6 text-center text-secondary">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </td>
                  <td className="py-3 px-6 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </td>
                </tr>
                {/* Group: Integración */}
                <tr className="bg-surface-variant">
                  <td
                    className="py-2 px-6 font-bold text-on-surface-variant uppercase text-xs tracking-wider mt-4"
                    colSpan={5}
                  >
                    Integración &amp; Datos
                  </td>
                </tr>
                <tr className="bg-surface border-b border-outline-variant/30">
                  <td className="py-3 px-6 text-on-surface">Exportación PDF</td>
                  <td className="py-3 px-6 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-outline text-sm">close</span>
                  </td>
                  <td className="py-3 px-6 text-center text-primary bg-primary/5">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </td>
                  <td className="py-3 px-6 text-center text-secondary">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </td>
                  <td className="py-3 px-6 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </td>
                </tr>
                <tr className="bg-surface-variant border-b border-outline-variant/30">
                  <td className="py-3 px-6 text-on-surface">Acceso API</td>
                  <td className="py-3 px-6 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-outline text-sm">close</span>
                  </td>
                  <td className="py-3 px-6 text-center text-primary bg-primary/5">
                    <span className="material-symbols-outlined text-outline text-sm">close</span>
                  </td>
                  <td className="py-3 px-6 text-center text-secondary">Básico</td>
                  <td className="py-3 px-6 text-center text-on-surface-variant">Completo</td>
                </tr>
                {/* Group: Soporte */}
                <tr className="bg-surface-variant">
                  <td
                    className="py-2 px-6 font-bold text-on-surface-variant uppercase text-xs tracking-wider mt-4"
                    colSpan={5}
                  >
                    Soporte
                  </td>
                </tr>
                <tr className="bg-surface">
                  <td className="py-3 px-6 text-on-surface">Nivel de asistencia</td>
                  <td className="py-3 px-6 text-center text-on-surface-variant">Comunidad</td>
                  <td className="py-3 px-6 text-center text-primary bg-primary/5">Email (24h)</td>
                  <td className="py-3 px-6 text-center text-secondary">Prioritario</td>
                  <td className="py-3 px-6 text-center font-semibold text-on-surface">Account Manager 24/7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Trust Strip */}
        <section className={`bg-surface-variant py-8 border-y border-outline-variant/50 reveal-section fade-up ${isRevealed ? "is-visible" : ""}`}>
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">enhanced_encryption</span>
              <span className="font-headline font-semibold text-on-surface">Datos encriptados</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">gavel</span>
              <span className="font-headline font-semibold text-on-surface">Cumplimiento Ley 172-13</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">account_balance</span>
              <span className="font-headline font-semibold text-on-surface">Integración DGII</span>
            </div>
          </div>
        </section>

        {/* 5. Bottom CTA Banner */}
        <section className={`bg-secondary text-on-secondary py-16 px-6 relative overflow-hidden reveal-section fade-up ${isRevealed ? "is-visible" : ""}`}>
          {/* Decorative pattern placeholder */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left md:w-2/3">
              <h2 className="text-3xl font-headline font-bold mb-3 text-white">
                ¿Necesitas una solución corporativa a gran escala?
              </h2>
              <p className="font-body text-secondary-container opacity-90">
                Construimos infraestructuras de validación dedicadas para instituciones financieras y grandes firmas de abogados.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
              <Link
                to="/contacto"
                className="bg-primary hover:bg-primary-hover text-on-primary font-label font-bold px-6 py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 btn-interact text-center"
              >
                Hablar con ventas
              </Link>
              <a
                href="https://portal.verifinca.com/legal#terminos"
                className="bg-transparent border border-outline-variant hover:bg-white/10 text-secondary-container text-on-secondary font-label font-medium px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 btn-interact text-center"
              >
                Ver documentación
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Component from LandingFooter */}
      <LandingFooter />
    </div>
  );
};
