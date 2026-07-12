import React from "react";

const ICONS = {
  checkCircle: "check_circle",
  cancel: "cancel",
};

interface PricingCardsProps {
  t: (key: string) => string;
  isRevealed: boolean;
  prices: { profesional: string; empresa: string; corporativo: string };
  handleFreePlan: () => void;
  handlePaidPlan: (plan: "profesional" | "empresa" | "corporativo") => void;
  modalMode?: boolean;
  currentPlan?: string | null;
}

export const PricingCards: React.FC<PricingCardsProps> = ({
  t,
  isRevealed,
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
    
    const badgeText = modalMode ? "PLAN ACTUAL" : t("pricing.cards.popular");
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
            {t("pricing.cards.free.title")}
          </h3>
          <div className="mb-6 flex items-baseline">
            <span className="text-3xl font-headline font-extrabold">$0</span>
            <span className="text-on-surface-variant font-body text-sm ml-2">
              {t("pricing.cards.period")}
            </span>
          </div>
          <p className="text-sm font-body text-on-surface-variant mb-8 flex-grow">
            {t("pricing.cards.free.desc")}
          </p>
          <ul className="space-y-4 mb-8 font-body text-sm text-on-surface">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl check-anim check-delay-1">
                {ICONS.checkCircle}
              </span>
              {t("pricing.cards.free.feature1")}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl check-anim check-delay-2">
                {ICONS.checkCircle}
              </span>
              {t("pricing.cards.free.feature2")}
            </li>
            <li className="flex items-start gap-3 opacity-50">
              <span className="material-symbols-outlined text-outline text-xl">
                {ICONS.cancel}
              </span>{" "}
              {t("pricing.cards.free.feature3")}
            </li>
          </ul>
          <button
            type="button"
            onClick={handleFreePlan}
            className="w-full py-3 rounded-lg border border-secondary text-secondary font-label font-bold hover:bg-secondary/5 transition-colors btn-interact text-center block"
          >
            {t("pricing.cards.free.button")}
          </button>
        </div>

        {/* Card 2: Profesional (Featured) */}
        <div
          className={getCardClasses("profesional", true, 2)}
        >
          {renderBadge("profesional", true)}
          <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
            {t("pricing.cards.pro.title")}
          </h3>
          <div className="mb-6 flex items-baseline">
            <span className="text-3xl font-headline font-extrabold text-primary whitespace-nowrap">
              {prices.profesional}
            </span>
            <span className="text-on-surface-variant font-body text-sm ml-2">
              {t("pricing.cards.period")}
            </span>
          </div>
          <p className="text-sm font-body text-on-surface-variant mb-8 flex-grow">
            {t("pricing.cards.pro.desc")}
          </p>
          <ul className="space-y-4 mb-8 font-body text-sm text-on-surface">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl fill-icon check-anim check-delay-1">
                {ICONS.checkCircle}
              </span>
              {t("pricing.cards.pro.feature1")}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl fill-icon check-anim check-delay-2">
                {ICONS.checkCircle}
              </span>
              {t("pricing.cards.pro.feature2")}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl fill-icon check-anim check-delay-3">
                {ICONS.checkCircle}
              </span>
              {t("pricing.cards.pro.feature3")}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl fill-icon check-anim check-delay-4">
                {ICONS.checkCircle}
              </span>
              {t("pricing.cards.pro.feature4")}
            </li>
          </ul>
          <button
            type="button"
            onClick={() => handlePaidPlan("profesional")}
            className="w-full py-3 rounded-lg bg-primary text-on-primary font-label font-bold hover:bg-primary-hover shadow-md transition-colors btn-interact text-center block"
            aria-label={t("pricing.cards.pro.button")}
          >
            {t("pricing.cards.pro.button")}
          </button>
        </div>

        {/* Card 3: Empresa */}
        <div
          className={getCardClasses("empresa", false, 3)}
        >
          {renderBadge("empresa", false)}
          <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
            {t("pricing.cards.empresa.title")}
          </h3>
          <div className="mb-6 flex items-baseline">
            <span className="text-3xl font-headline font-extrabold text-secondary whitespace-nowrap">
              {prices.empresa}
            </span>
            <span className="text-on-surface-variant font-body text-sm ml-2">
              {t("pricing.cards.period")}
            </span>
          </div>
          <p className="text-sm font-body text-on-surface-variant mb-8 flex-grow">
            {t("pricing.cards.empresa.desc")}
          </p>
          <ul className="space-y-4 mb-8 font-body text-sm text-on-surface">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-xl check-anim check-delay-1">
                {ICONS.checkCircle}
              </span>
              {t("pricing.cards.empresa.feature1")}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-xl check-anim check-delay-2">
                {ICONS.checkCircle}
              </span>
              {t("pricing.cards.empresa.feature2")}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-xl check-anim check-delay-3">
                {ICONS.checkCircle}
              </span>
              {t("pricing.cards.empresa.feature3")}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-xl check-anim check-delay-4">
                {ICONS.checkCircle}
              </span>
              {t("pricing.cards.empresa.feature4")}
            </li>
          </ul>
          <button
            type="button"
            onClick={() => handlePaidPlan("empresa")}
            className="w-full py-3 rounded-lg border border-secondary text-secondary font-label font-bold hover:bg-secondary/5 transition-colors btn-interact text-center block"
            aria-label={t("pricing.cards.empresa.button")}
          >
            {t("pricing.cards.empresa.button")}
          </button>
        </div>

        {/* Card 4: Corporativo */}
        <div
          className={getCardClasses("corporativo", false, 4)}
        >
          {renderBadge("corporativo", false)}
          <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
            {t("pricing.cards.corporativo.title")}
          </h3>
          <div className="mb-6 flex items-baseline">
            <span className="text-3xl font-headline font-extrabold text-on-surface whitespace-nowrap">
              {prices.corporativo}
            </span>
            <span className="text-on-surface-variant font-body text-sm ml-2">
              {t("pricing.cards.period")}
            </span>
          </div>
          <p className="text-sm font-body text-on-surface-variant mb-8 flex-grow">
            {t("pricing.cards.corporativo.desc")}
          </p>
          <ul className="space-y-4 mb-8 font-body text-sm text-on-surface">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-on-surface text-xl check-anim check-delay-1">
                {ICONS.checkCircle}
              </span>
              {t("pricing.cards.corporativo.feature1")}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-on-surface text-xl check-anim check-delay-2">
                {ICONS.checkCircle}
              </span>
              {t("pricing.cards.corporativo.feature2")}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-on-surface text-xl check-anim check-delay-3">
                {ICONS.checkCircle}
              </span>
              {t("pricing.cards.corporativo.feature3")}
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-on-surface text-xl check-anim check-delay-4">
                {ICONS.checkCircle}
              </span>
              {t("pricing.cards.corporativo.feature4")}
            </li>
          </ul>
          <button
            type="button"
            onClick={() => handlePaidPlan("corporativo")}
            className="w-full py-3 rounded-lg bg-secondary text-on-secondary font-label font-bold hover:bg-secondary/90 transition-colors btn-interact text-center block text-secondary-container"
            aria-label={t("pricing.cards.corporativo.button")}
          >
            {t("pricing.cards.corporativo.button")}
          </button>
        </div>
      </div>
    </section>
  );
};
