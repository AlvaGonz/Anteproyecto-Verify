import React from "react";
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
        <FeaturedProjectsSection />
        <MethodologySection />
        <CtaSection />
      </main>

      <LandingFooter />
    </div>
  );
};
