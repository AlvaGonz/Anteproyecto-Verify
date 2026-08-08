import { describe, it, expect } from 'vitest';
import { LandingNav } from '../../../shared/components/layout/LandingNav';
import { LandingFooter } from '../../../shared/components/layout/LandingFooter';
import { BackToTopButton } from '../../../shared/components/ui/BackToTopButton';
import { TerminosSection } from '../LegalSections1';
import { MarcoLegalSection } from '../LegalSections2';

describe('Imports', () => {
  it('should not be undefined', () => {
    expect(LandingNav).toBeDefined();
    expect(LandingFooter).toBeDefined();
    expect(BackToTopButton).toBeDefined();
    expect(TerminosSection).toBeDefined();
    expect(MarcoLegalSection).toBeDefined();
  });
});
