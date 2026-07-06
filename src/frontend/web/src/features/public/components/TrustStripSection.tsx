import React from "react";
import { motion as m } from "framer-motion";
import { fadeInUp } from "./motion";

export const TrustStripSection: React.FC = () => (
  <section className="bg-white py-20 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
      {[
        { value: "120+", label: "Expedientes Validados" },
        { value: "1.2B", label: "Inversión Auditada" },
        { value: "24h", label: "Garantía de Respuesta" },
        { value: "RD", label: "Alcance Nacional" },
      ].map((stat, i) => (
        <m.div
          {...fadeInUp}
          key={stat.label}
          transition={{ ...fadeInUp.transition, delay: i * 0.1 }}
          className="text-center md:text-left space-y-1"
        >
          <p className="text-4xl md:text-5xl font-display font-black text-secondary tracking-tighter">
            {stat.value}
          </p>
          <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
            {stat.label}
          </p>
        </m.div>
      ))}
    </div>
  </section>
);
