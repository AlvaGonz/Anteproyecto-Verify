import React, { Suspense } from "react";
import { LandingNav } from "../features/public/components/LandingNav";
import { HeroSection } from "../features/public/components/HeroSection";
import { TrustStripSection } from "../features/public/components/TrustStripSection";
import { FeaturedProjectsSection } from "../features/public/components/FeaturedProjectsSection";
import { MethodologySection } from "../features/public/components/MethodologySection";
import { CtaSection } from "../features/public/components/CtaSection";
import { LandingFooter } from "../features/public/components/LandingFooter";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white selection:bg-primary/20 selection:text-primary">
      <LandingNav />

      <main>
        <HeroSection />
        <TrustStripSection />
        <Suspense fallback={
          <section id="proyectos" className="py-32 bg-surface-raised overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-display font-black text-secondary tracking-tight">
                    Proyectos <span className="italic text-primary">Verificados</span>
                  </h2>
                  <p className="text-text-secondary text-sm font-bold uppercase tracking-widest max-w-xl">
                    Proyectos inmobiliarios con validación documental, financiera y territorial aprobada
                  </p>
                </div>
              </div>
            </div>
            <div className="vf-viewport relative overflow-hidden">
              <div className="vf-track gap-8 py-4 animate-pulse" style={{ height: "380px" }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="group bg-white rounded-[40px] overflow-hidden border border-outline-variant/20 shadow-raised flex-shrink-0" style={{ width: "400px" }}>
                    <div className="relative aspect-video overflow-hidden">
                      <div className="w-full h-full bg-gray-100" />
                    </div>
                    <div className="p-8 space-y-6">
                      <div className="space-y-2">
                        <div className="h-7 bg-gray-100 rounded w-3/4" />
                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                      </div>
                      <div className="pt-6 border-t border-outline-variant/20 space-y-4">
                        <div className="h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-200" style={{ width: "80%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        }>
          <FeaturedProjectsSection />
        </Suspense>
        <MethodologySection />
        <CtaSection />
      </main>

      <LandingFooter />
    </div>
  );
};
