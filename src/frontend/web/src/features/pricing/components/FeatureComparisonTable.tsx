import React from "react";

const ICONS = {
  close: "close",
  check: "check",
};

interface FeatureComparisonTableProps {
  t: (key: string) => string;
  isRevealed: boolean;
}

export const FeatureComparisonTable: React.FC<FeatureComparisonTableProps> = ({
  t,
  isRevealed,
}) => {
  return (
    <section
      className={`max-w-7xl mx-auto px-6 pb-24 hidden md:block reveal-section fade-up ${isRevealed ? "is-visible" : ""}`}
    >
      <h2 className="text-3xl font-headline font-bold text-center mb-12">
        {t("pricing.comparison.title")}
      </h2>
      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface">
              <th className="py-4 px-6 font-headline font-bold text-on-surface w-1/5 border-b border-outline-variant">
                {t("pricing.comparison.charHeader")}
              </th>
              <th className="py-4 px-6 font-label font-semibold text-center text-on-surface w-1/5 border-b border-outline-variant">
                {t("pricing.cards.free.title")}
              </th>
              <th className="py-4 px-6 font-label font-bold text-center text-on-surface bg-primary/5 w-1/5 border-b-2 border-primary">
                <span className="inline-block relative">
                  {t("pricing.cards.pro.title")}
                  <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-primary rounded-full"></span>
                </span>
              </th>
              <th className="py-4 px-6 font-label font-semibold text-center text-secondary w-1/5 border-b border-outline-variant">
                {t("pricing.cards.empresa.title")}
              </th>
              <th className="py-4 px-6 font-label font-semibold text-center text-on-surface w-1/5 border-b border-outline-variant">
                {t("pricing.cards.corporativo.title")}
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
                {t("pricing.comparison.capHeader")}
              </td>
            </tr>
            <tr className="bg-surface border-b border-outline-variant/30">
              <td className="py-3 px-6 text-on-surface">
                {t("pricing.comparison.limit")}
              </td>
              <td className="py-3 px-6 text-center text-on-surface-variant">
                1
              </td>
              <td className="py-3 px-6 text-center font-bold text-primary bg-primary/5">
                25
              </td>
              <td className="py-3 px-6 text-center text-on-surface-variant">
                100
              </td>
              <td className="py-3 px-6 text-center text-on-surface-variant">
                {t("pricing.comparison.unlimited")}
              </td>
            </tr>
            <tr className="bg-surface-variant border-b border-outline-variant/30">
              <td className="py-3 px-6 text-on-surface">
                {t("pricing.comparison.projects")}
              </td>
              <td className="py-3 px-6 text-center text-on-surface-variant">
                1
              </td>
              <td className="py-3 px-6 text-center font-bold text-primary bg-primary/5">
                5
              </td>
              <td className="py-3 px-6 text-center text-on-surface-variant">
                30
              </td>
              <td className="py-3 px-6 text-center text-on-surface-variant">
                50
              </td>
            </tr>
            {/* Group: Soporte */}
            <tr className="bg-surface-variant">
              <td
                className="py-2 px-6 font-bold text-on-surface-variant uppercase text-xs tracking-wider mt-4"
                colSpan={5}
              >
                {t("pricing.comparison.supportHeader")}
              </td>
            </tr>
            <tr className="bg-surface">
              <td className="py-3 px-6 text-on-surface">
                {t("pricing.comparison.supportLevel")}
              </td>
              <td className="py-3 px-6 text-center text-on-surface-variant">
                {t("pricing.comparison.community")}
              </td>
              <td className="py-3 px-6 text-center text-primary bg-primary/5">
                {t("pricing.comparison.email")}
              </td>
              <td className="py-3 px-6 text-center text-secondary">
                {t("pricing.comparison.priority")}
              </td>
              <td className="py-3 px-6 text-center font-semibold text-on-surface">
                {t("pricing.comparison.manager")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
