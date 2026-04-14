# Task Plan — DocumentUploadFlow Implementation

## Phase 1: Discovery (Mapeo de Contexto y Skills)
- [ ] 1.1 Read project context (`DESIGN.md`, HTML source, router, pages/features, shared components, styles, package.json).
- [ ] 1.2 Document structure (Router pattern, Sidebar existence, feature existence, etc.).
- [ ] 1.3 Select Skills.

## Phase 2: Execution (Implementación)
- [ ] 2.1 Sync design tokens with `tailwind.config.ts`.
- [ ] 2.2 Create components in `src/features/document-upload/`.
  - [ ] `UploadWizardStepper.tsx`
  - [ ] `DropZoneArea.tsx`
  - [ ] `FileQueueList.tsx`
  - [ ] `DocumentMetadataForm.tsx`
  - [ ] `SecurityInfoCard.tsx`
  - [ ] `UploadWizardFooter.tsx`
  - [ ] `UploadInstitutionalFooter.tsx`
  - [ ] `DocumentUploadPage.tsx`
- [ ] 2.3 Create/Update `PortalSidebarNav.tsx` in `src/shared/components/`.
- [ ] 2.4 Register authenticated route in router.

## Phase 3: Verification (Validación)
- [ ] 3.1 Run TS check and Linting.
- [ ] 3.2 Visual Checklist with Dev Server.
- [ ] 3.3 Verify no regressions via Build.

## Error Protocol
- Log errors to `progress.md`
- Max 3 retries per failure.
