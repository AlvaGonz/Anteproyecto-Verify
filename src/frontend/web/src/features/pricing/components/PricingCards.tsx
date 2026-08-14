import React from "react";

const ICONS = {
  checkCircle: "check_circle",
  cancel: "cancel",
};

interface PricingCardsProps {
  isRevealed: boolean;
  prices: { profesional: string; empresa: string; corporativo: string };
  handleFreePlan: () => void;
  handlePaidPlan: (plan: "profesional" | "empresa" | "corporativo") => void;
  modalMode?: boolean;
  currentPlan?: string | null;
}

export const PricingCards: React.FC<PricingCardsProps> = ({  isRevealed,
  prices,
  handleFreePlan,
  handlePaidPlan,
  modalMode,
  currentPlan,
}) => {
  const getCardClasses = (planKey: string, isDefaultPopular: boolean, staggerNum: number) => {
    const isEmbossed = modalMode ? currentPlan === planKey : isDefaultPopular;
    
    if (isEmbossed) {
      return `bg-surface rounded-xl p-6 xl:p-8 border-2 border-primary shadow-xl flex flex-col text-left relative transform md:-translate-y-4 card-enter card-stagger-${staggerNum} hover:-translate-y-6 hover:shadow-2xl transition-all duration-300 z-10 ${isRevealed ? "is-visible" : ""}`;
    }
    return `bg-surface rounded-xl p-6 xl:p-8 border border-outline-variant/50 shadow-sm flex flex-col text-left card-enter card-stagger-${staggerNum} hover:-translate-y-2 hover:shadow-lg transition-all duration-300 ${isRevealed ? "is-visible" : ""}`;
  };

  const renderBadge = (planKey: string, isDefaultPopular: boolean) => {
    const isEmbossed = modalMode ? currentPlan === planKey : isDefaultPopular;
    if (!isEmbossed) return null;
    
    const badgeText = modalMode ? "PLAN ACTUAL" : "MÁS POPULAR";
    return (
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-on-primary text-xs font-label font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm badge-pulse whitespace-nowrap">
        {badgeText}
      </div>
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-6 pb-24 reveal-section">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Consulta */}
        <div
          className={getCardClasses("consultor", false, 1)}
        >
          {renderBadge("consultor", false)}
          <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
            {"Consultor"}
          </h3>
          <div className="mb-6 flex items-baseline">
            <span className="text-3xl font-headline font-extrabold">$0</span>
            <span className="text-on-surface-variant font-body text-sm ml-2">
              {"/mes"}
            </span>
          </div>
          <p className="text-sm font-body text-on-surface-variant mb-8 flex-grow">
            {"Para usuarios ocasionales que necesitan consultas básicas de inmuebles."}
          </p>
          <ul className="space-y-4 mb-8 font-body text-sm text-on-surface">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl check-anim check-delay-1">
                {ICONS.checkCircle}
              </span>
              {"1 consultas /mes"}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl check-anim check-delay-2">
                {ICONS.checkCircle}
              </span>
              {"Datos públicos básicos"}
            </li>
            <li className="flex items-start gap-3 opacity-50">
              <span className="material-symbols-outlined text-outline text-xl">
                {ICONS.cancel}
              </span>{" "}
              {"Presentación pública de sus proyectos"}
            </li>
          </ul>
          <button
            type="button"
            onClick={handleFreePlan}
            className="w-full py-3 rounded-lg border border-secondary text-secondary font-label font-bold hover:bg-secondary/5 transition-colors btn-interact text-center block"
          >
            {"Comenzar gratis"}
          </button>
        </div>

        {/* Card 2: Profesional (Featured) */}
        <div
          className={getCardClasses("profesional", true, 2)}
        >
          {renderBadge("profesional", true)}
          <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
            {"Profesional"}
          </h3>
          <div className="mb-6 flex items-baseline">
            <span className="text-3xl font-headline font-extrabold text-primary whitespace-nowrap">
              {prices.profesional}
            </span>
            <span className="text-on-surface-variant font-body text-sm ml-2">
              {"/mes"}
            </span>
          </div>
          <p className="text-sm font-body text-on-surface-variant mb-8 flex-grow">
            {"Herramientas completas para agentes independientes y pequeñas agencias."}
          </p>
          <ul className="space-y-4 mb-8 font-body text-sm text-on-surface">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl fill-icon check-anim check-delay-1">
                {ICONS.checkCircle}
              </span>
              {"25 consultas /mes"}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl fill-icon check-anim check-delay-2">
                {ICONS.checkCircle}
              </span>
              {"5 proyectos registrables"}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl fill-icon check-anim check-delay-3">
                {ICONS.checkCircle}
              </span>
              {"Consultas de proyectos por QR"}
            </li>
          </ul>
          <button
            type="button"
            onClick={() => handlePaidPlan("profesional")}
            className="w-full py-3 rounded-lg bg-primary text-on-primary font-label font-bold hover:bg-primary-hover shadow-md transition-colors btn-interact text-center block"
            aria-label={"Elegir Profesional"}
          >
            {"Elegir Profesional"}
          </button>
        </div>

        {/* Card 3: Empresa */}
        <div
          className={getCardClasses("empresa", false, 3)}
        >
          {renderBadge("empresa", false)}
          <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
            {"Empresa"}
          </h3>
          <div className="mb-6 flex items-baseline">
            <span className="text-3xl font-headline font-extrabold text-secondary whitespace-nowrap">
              {prices.empresa}
            </span>
            <span className="text-on-surface-variant font-body text-sm ml-2">
              {"/mes"}
            </span>
          </div>
          <p className="text-sm font-body text-on-surface-variant mb-8 flex-grow">
            {"Volumen alto para inmobiliarias y equipos de analistas."}
          </p>
          <ul className="space-y-4 mb-8 font-body text-sm text-on-surface">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-xl check-anim check-delay-1">
                {ICONS.checkCircle}
              </span>
              {"100 consultas /mes"}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-xl check-anim check-delay-2">
                {ICONS.checkCircle}
              </span>
              {"10 proyectos registrables"}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-xl check-anim check-delay-3">
                {ICONS.checkCircle}
              </span>
              {"Multiusuario (hasta 5)"}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-xl check-anim check-delay-4">
                {ICONS.checkCircle}
              </span>
              {"Consultas de proyectos por QR"}
            </li>
          </ul>
          <button
            type="button"
            onClick={() => handlePaidPlan("empresa")}
            className="w-full py-3 rounded-lg border border-secondary text-secondary font-label font-bold hover:bg-secondary/5 transition-colors btn-interact text-center block"
            aria-label={"Elegir Empresa"}
          >
            {"Elegir Empresa"}
          </button>
        </div>

        {/* Card 4: Corporativo */}
        <div
          className={getCardClasses("corporativo", false, 4)}
        >
          {renderBadge("corporativo", false)}
          <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
            {"Corporativo"}
          </h3>
          <div className="mb-6 flex items-baseline">
            <span className="text-3xl font-headline font-extrabold text-on-surface whitespace-nowrap">
              {prices.corporativo}
            </span>
            <span className="text-on-surface-variant font-body text-sm ml-2">
              {"/mes"}
            </span>
          </div>
          <p className="text-sm font-body text-on-surface-variant mb-8 flex-grow">
            {"Soluciones a medida para bancos, desarrolladoras y gobierno."}
          </p>
          <ul className="space-y-4 mb-8 font-body text-sm text-on-surface">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-on-surface text-xl check-anim check-delay-1">
                {ICONS.checkCircle}
              </span>
              {"Consultas ilimitadas"}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-on-surface text-xl check-anim check-delay-2">
                {ICONS.checkCircle}
              </span>
              {"50 proyectos registrables"}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-on-surface text-xl check-anim check-delay-3">
                {ICONS.checkCircle}
              </span>
              {"Multiusuario (hasta 30)"}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-on-surface text-xl check-anim check-delay-4">
                {ICONS.checkCircle}
              </span>
              {"Consultas de proyectos por QR"}
            </li>
          </ul>
          <button
            type="button"
            onClick={() => handlePaidPlan("corporativo")}
            className="w-full py-3 rounded-lg bg-secondary text-on-secondary font-label font-bold hover:bg-secondary/90 transition-colors btn-interact text-center block text-secondary-container"
            aria-label={"Elegir Corporativo"}
          >
            {"Elegir Corporativo"}
          </button>
        </div>
      </div>
    </section>
  );
};
