---
trigger: model_decision
description: Agent must apply these constraints before writing any JSX, CSS, or Tailwind class.
---

---
rule: accessibility
description: >
  Enforces WCAG 2.2 AA compliance on every UI task in VeriFinca.
  Agent must apply these constraints before writing any JSX, CSS, or Tailwind class.
  Invokes skill: accessibility + wcag-audit-patterns.
trigger: always
---

# Accessibility Rule — VeriFinca

> **Source skills:** `.agents/skills/accessibility/SKILL.md` · `.agents/skills/wcag-audit-patterns/SKILL.md`  
> **Standard:** WCAG 2.2 Level AA (minimum). AAA where noted.  
> **Design token source:** `.agents/docs/design.md` — never hardcode hex values.

---

## 0. Pre-task Checklist (run before any UI implementation)

Before writing a single line of JSX or CSS, the agent MUST confirm:

- [ ] Color tokens loaded from `design.md` — no hardcoded hex values
- [ ] Component has an accessible name (label, aria-label, or visually-hidden text)
- [ ] Interaction is keyboard-operable
- [ ] Focus state is visible and uses `--color-primary` focus ring
- [ ] Target size meets 44×44px (Apple HIG / WCAG 2.5.5 recommended)

Skipping this checklist is a protocol violation. Stop and complete it.

---

## 1. Color Contrast — Non-Negotiable

| Text type | Minimum ratio | Token pair example |
|---|---|---|
| Normal body text (< 18px) | **4.5:1** | `--color-text-primary` `#111144` on `#FFFFFF` → 17.68:1 ✅ |
| Large text (≥ 18px / ≥ 14px bold) | **3:1** | `--color-secondary` `#223382` on `#FFFFFF` → 11.27:1 ✅ |
| UI components & input borders | **3:1** | `--color-border` `#C8BFB5` on `#FFFFFF` → verify at build |
| Disabled states | exempt | Use `--color-neutral` `#DAD1C8` text `#9E9E9E` |

**Forbidden:**
- `--color-primary` `#F98513` as text on white — contrast is 2.89:1. **Never use as body text.**
- `--color-text-secondary` `#5C5C5C` on `--color-neutral` `#DAD1C8` — verify before use, ratio is borderline.
- Any hardcoded color value not declared in `design.md`.

**Required on every PR touching color:**

```bash
# Run before commit — zero tolerance for new violations
npx @axe-core/cli <url> --include "body"
```

---

## 2. Touch Targets — Minimum 44×44px

WCAG 2.2 AA requires 24×24px (2.5.8). VeriFinca enforces Apple HIG / WCAG 2.5.5 recommended minimum: **44×44px** on all interactive elements.

```tsx
// ✅ Required Tailwind pattern for all interactive elements
<button className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center">
  ...
</button>

// ✅ Icon-only buttons MUST use this wrapper
<button
  aria-label="Open validation menu"
  className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary] focus-visible:ring-offset-2"
>
  <svg aria-hidden="true" focusable="false">...</svg>
</button>
```

**Forbidden:**
- `<button>` or `<a>` with only icon content and no `aria-label` or `.visually-hidden` child.
- Any interactive element with `min-h` below `44px` on mobile breakpoints (`xs`, `sm`).
- `onClick` on a `<div>` or `<span>` — use native `<button>` or `<a>`.

---

## 3. Semantic HTML — Native First

Prefer native elements. ARIA is the last resort, not the first tool.

```tsx
// ❌ FORBIDDEN — ARIA role on div
<div role="button" tabIndex={0} onClick={handleAction}>Submit</div>

// ✅ REQUIRED — Native element
<button onClick={handleAction}>Submit</button>

// ❌ FORBIDDEN — div-based checkbox
<div role="checkbox" aria-checked={checked}>Option</div>

// ✅ REQUIRED — Native input
<label>
  <input type="checkbox" checked={checked} onChange={toggle} />
  Option
</label>
```

**Required heading hierarchy per page:**
h1 → Page title (one per page, Manrope 700 32px)
h2 → Section (Manrope 600 24px)
h3 → Subsection / Card title (Manrope 600 20px)

text

Never skip heading levels. Never use headings for visual styling only — use `className` instead.

**Required landmark regions on every page:**

```tsx
<header role="banner">...</header>
<nav aria-label="Main navigation">...</nav>
<main id="main-content">...</main>
<footer role="contentinfo">...</footer>
```

---

## 4. Icon-Only Elements — aria-label Mandatory

Every interactive element that contains only an icon MUST have an accessible name via one of these two patterns. No exceptions.

**Pattern A — aria-label (preferred for simple labels):**

```tsx
<button aria-label="Dismiss notification">
  <XIcon aria-hidden="true" focusable={false} className="w-5 h-5" />
</button>
```

**Pattern B — visually hidden text (preferred when label needs i18n):**

```tsx
<button>
  <XIcon aria-hidden="true" focusable={false} className="w-5 h-5" />
  <span className="sr-only">Dismiss notification</span>
</button>
```

**Required `sr-only` class in global CSS (Tailwind built-in):**

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**Forbidden:**
- `<button>` or `<a>` with only `<svg>` child and no `aria-label`, `aria-labelledby`, or `.sr-only` text.
- SVG icons without `aria-hidden="true"` — they will be read aloud by screen readers as garbage text.
- `title` attribute on SVG as the sole accessible name — unreliable across screen reader/browser combos.

---

## 5. Focus Management

```css
/* ✅ REQUIRED — Never suppress :focus-visible */
:focus {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--color-primary); /* #F98513 */
  outline-offset: 2px;
}
```

```tsx
// ✅ REQUIRED — Modals must trap focus and restore on close
// Use the native <dialog> element — it handles focus trap automatically
<dialog
  ref={dialogRef}
  onClose={handleClose}
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Confirm Action</h2>
  <p id="modal-description">...</p>
  <button autoFocus onClick={handleClose}>Close</button>
</dialog>
```

**Forbidden:**
- `*:focus { outline: none }` or `outline: 0` without a `:focus-visible` replacement.
- Modal that does not return focus to the trigger element on close.
- `tabIndex > 0` — never use positive tabindex values.

---

## 6. Forms and Error States

Every `<input>`, `<select>`, and `<textarea>` MUST have:

1. A `<label>` with matching `htmlFor` / `id`
2. `aria-describedby` pointing to helper or error text
3. On validation error: `aria-invalid="true"` + `role="alert"` on the error message

```tsx
// ✅ REQUIRED pattern for all form fields
<div className="flex flex-col gap-1.5">
  <label htmlFor="project-rnc" className="text-sm font-medium text-[--color-text-primary]">
    RNC del Proyecto
  </label>
  <input
    id="project-rnc"
    type="text"
    aria-invalid={!!errors.rnc}
    aria-describedby={errors.rnc ? "rnc-error" : "rnc-hint"}
    className="..."
  />
  {errors.rnc ? (
    <span id="rnc-error" role="alert" className="text-xs text-[--color-error]">
      <ErrorIcon aria-hidden="true" /> {errors.rnc}
    </span>
  ) : (
    <span id="rnc-hint" className="text-xs text-[--color-text-secondary]">
      Ingresa el RNC con 9 dígitos
    </span>
  )}
</div>
```

---

## 7. Motion — Respect User Preference

All animations using `anime.js` or CSS transitions MUST be wrapped:

```css
/* ✅ REQUIRED — Wrap all transitions and animations */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 8. Skip Link — Required on Every Page

```tsx
// ✅ REQUIRED — First child of <body>, every page
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[--color-primary] focus:text-white focus:rounded-lg"
>
  Skip to main content
</a>
```

---

## 9. Agent Verification Gate

Before marking any UI task complete, the agent MUST run:

```bash
# 1. Automated axe scan
npx @axe-core/cli http://localhost:5173 --include "main"

# 2. Keyboard check (manual)
# Tab through the new component — every interactive element must be reachable
# Enter/Space must activate buttons and checkboxes
# Escape must close modals/dropdowns

# 3. Contrast check
# Open browser DevTools → Accessibility → Color Contrast
# All new text elements must show ≥ 4.5:1 for normal text
```

**A UI task is NOT complete if any axe violation with severity `critical` or `serious` is open.**

---

## 10. WCAG 2.2 New Criteria — Enforced

These are new in WCAG 2.2 and must not be overlooked:

| Criterion | Level | Rule |
|---|---|---|
| 2.4.11 Focus Not Obscured | AA | Focused element must not be hidden by sticky header/footer. Use `scroll-margin-top: 80px` |
| 2.4.12 Focus Not Obscured Enhanced | AAA | No part of focus indicator may be hidden |
| 2.5.7 Dragging Movements | AA | Any drag action must have a single-pointer alternative |
| 2.5.8 Target Size Minimum | AA | 24×24px minimum — VeriFinca enforces 44×44px |
| 3.2.6 Consistent Help | AA | Help mechanism must appear in same order on every page |
| 3.3.7 Redundant Entry | A | Never ask user to re-enter data provided in same session |
| 3.3.8 Accessible Authentication | AA | Login must support paste/autofill; offer passwordless alternative |

---

## Rollback Trigger

If any of the following are introduced, the agent MUST stop, revert to the last green commit, and raise a human gate:

- New `axe` violation with severity `critical`
- Any color used as text that is not in the `design.md` token map
- A `<dialog>` or modal without focus trap
- An icon-only button without `aria-label` or `.sr-only` text
- `outline: none` without `:focus-visible` replacement