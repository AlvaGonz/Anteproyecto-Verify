import React from "react";

const ICONS = {
  close: "close",
  check: "check",
};

interface FeatureComparisonTableProps {
  isRevealed: boolean;
}

export const FeatureComparisonTable: React.FC<FeatureComparisonTableProps> = ({  isRevealed,
}) => {
  return (
    <section
      className={`max-w-7xl mx-auto px-6 pb-24 hidden md:block reveal-section fade-up ${isRevealed ? "is-visible" : ""}`}
    >
      <h2 className="text-3xl font-headline font-bold text-center mb-12">
        {"Comparativa detallada"}
      </h2>
      <div className="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface">
              <th className="py-4 px-6 font-headline font-bold text-on-surface w-1/5 border-b border-outline-variant">
                {"Características"}
              </th>
              <th className="py-4 px-6 font-label font-semibold text-center text-on-surface w-1/5 border-b border-outline-variant">
                {"Consultor"}
              </th>
              <th className="py-4 px-6 font-label font-bold text-center text-on-surface bg-primary/5 w-1/5 border-b-2 border-primary">
                <span className="inline-block relative">
                  {"Profesional"}
                  <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-primary rounded-full"></span>
                </span>
              </th>
              <th className="py-4 px-6 font-label font-semibold text-center text-secondary w-1/5 border-b border-outline-variant">
                {"Empresa"}
              </th>
              <th className="py-4 px-6 font-label font-semibold text-center text-on-surface w-1/5 border-b border-outline-variant">
                {"Corporativo"}
              </th>
            </tr>
          </thead>
          <tbody className="font-body text-sm">
            <tr className="bg-surface border-b border-outline-variant/30">
              <td className="py-3 px-6 text-on-surface">
                {"Límite mensual"}
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
                {"Ilimitado"}
              </td>
            </tr>
            <tr className="bg-surface-variant border-b border-outline-variant/30">
              <td className="py-3 px-6 text-on-surface">
                {"Proyectos registrables"}
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
            <tr className="bg-surface">
              <td className="py-3 px-6 text-on-surface">
                {"Consultas de proyectos por QR"}
              </td>
              <td className="py-3 px-6 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-outline text-sm">
                  {ICONS.close}
                </span>
              </td>
              <td className="py-3 px-6 text-center text-primary bg-primary/5">
                <span className="material-symbols-outlined text-sm">
                  {ICONS.check}
                </span>
              </td>
              <td className="py-3 px-6 text-center text-secondary">
                <span className="material-symbols-outlined text-sm">
                  {ICONS.check}
                </span>
              </td>
              <td className="py-3 px-6 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">
                  {ICONS.check}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
