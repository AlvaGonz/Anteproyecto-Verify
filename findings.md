# Findings: Stitch Landing Page UI/UX

## Design Pattern & Guidelines (ui-ux-pro-max)
- **Style:** Glassmorphism, transparent, dark professional tones.
- **Palette (Reference):**
  - Primary / Text headings: `#223382` (Deep Blue)
  - Secondary: `#F98513` (Orange CTA)
  - Surface: `bg-surface` (`#fff8f3` based on CSS variables but `code.html` uses classes directly)
- **Fonts:** `Manrope` for headings, `Inter` for body.
- **Pattern:** Before-After Transformation. Features clear Hero search, Trust Metrics, Carousel portfolio, 3-step Methodology, and a final CTA.

## Implementation details from code.html
- The CSS uses specific tailor-made classes:
  - `bg-[#223382]`
  - `bg-[#F98513]`
  - `bg-surface-container-lowest`
  - `border-outline-variant/30`
- The `LandingPage.tsx` React component uses dynamic `projects.map` rendering.
- I will replace the existing UI segments in `LandingPage.tsx` with the new design:
  1. `LandingNav` -> Dark Top Navigation Bar.
  2. `HeroSection` -> Geometric Background + Title + Search.
  3. `TrustStrip` -> New section added for trust metrics.
  4. `ProjectsShowcase` -> Carousel Section mapped to `projects.filter`.
  5. `HowItWorksSection` -> Bento Inspired 3-step process.
  6. `VerificationSection` -> Changed to the Final CTA shown in the design.
  7. `Footer` -> Dark sleek footer.
