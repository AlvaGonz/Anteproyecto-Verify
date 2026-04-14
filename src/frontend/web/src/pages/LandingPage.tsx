import React from "react";
import {
  LandingNav,
  HeroSection,
  TrustStripSection,
  FeaturedProjectsSection,
  MethodologySection,
  CtaSection,
  LandingFooter
} from "../features/public/components";

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
