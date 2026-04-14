# task_plan.md — ProjectDetail Component Transformation

## Objective
Transform the `code.html` from `stitch_verifinca_real_estate_validation/project_detail/` into a modular, production-ready React component (`ProjectDetail.tsx`) using TypeScript, Tailwind V4, and the MP113 design system.

## Phase 1: Setup & Scaffolding
- [ ] Create `components` subfolder in `stitch_verifinca_real_estate_validation/project_detail/`.
- [ ] Create `ProjectDetail.tsx` as the main entry point.
- [ ] Define shared constants (colors, spacing) based on `DESIGN.md`.

## Phase 2: Component Decomposition
- [ ] **Sub-component 1: HeroHeader**
    - [ ] Port HTML structure.
    - [ ] Add Framer Motion entry animations.
    - [ ] Integrate Lucide icons.
- [ ] **Sub-component 2: InfoSection**
    - [ ] Implement `ProjectInfo` card.
    - [ ] Implement `DocumentChecklist`.
- [ ] **Sub-component 3: SummarySidebar**
    - [ ] Implement `IntegrityScoreCard`.
    - [ ] Implement `ValidationTimeline`.
- [ ] **Sub-component 4: FooterSection**
    - [ ] Implement `OfficialSeal`.

## Phase 3: Integration & State
- [ ] Assemble all sub-components into `ProjectDetail`.
- [ ] Add basic props interface (e.g., `ProjectData`).
- [ ] Ensure responsive behavior (Tailwind v4 grid).

## Phase 4: Polish & Refactor
- [ ] Extract repeated UI patterns into local shared components (e.g., `Badge`, `IconButton`).
- [ ] Apply final color tokens from `DESIGN.md`.
- [ ] Lint check & type validation (TS 5.8).

## Phase 5: Verification
- [ ] Use `groq-autofix` (simulated via thought or actual check if possible) to audit the code.
- [ ] Final review against `DESIGN.md` rules.
