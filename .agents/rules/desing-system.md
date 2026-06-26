---
trigger: model_decision
description: This is used when its a frontend style related changes
---

# Design System Rules

> Skills: `design-taste-frontend` · `frontend-design` · `tailwind-css-patterns` · `wcag-audit-patterns` · `ui-ux-pro-max` · `stitch-ui-design`  
> Reference: `DESIGN.md` tokens & components · `AGENTS.md` MCP mandate (Stitch)  

---

## 1. MCP First: Stitch Is the Source of Truth

Before writing or changing any UI code (React, CSS, Tailwind, Storybook), **you MUST**:

1. Connect to **Stitch MCP**.
2. Fetch the latest design tokens for:
   - Colors (`--color-*`).
   - Typography (Manrope, Inter, sizes, weights).
   - Radius, spacing (8px grid), shadows.

**Forbidden:**

- Guessing hex codes, font sizes, border-radius, or spacing from memory.
- Adding new tokens that are not defined in Stitch or DESIGN.md.

If Stitch MCP is unavailable, **STOP** and mark a blocker in `docs/PWF/progress.md`. Do not proceed with UI implementation while context-blind.

---

## 2. No Hardcoded Colors — Only Tokens

All colors in UI code MUST come from the token map, never from raw hex codes or ad‑hoc Tailwind values.

### 2.1 Allowed Color Usage

Use CSS variables or mapped Tailwind utilities only:

- CSS:
  ```css
  color: var(--color-text-primary);
  background-color: var(--color-primary);
  border-color: var(--color-border);
  ```
- Tailwind (example mapping):
  - `bg-primary` → `var(--color-primary)` (`#F98513`)
  - `text-primary` → `var(--color-text-primary)` (`#111144`)
  - `bg-surface` → `var(--color-surface)`
  - `bg-surface-raised` → `var(--color-surface-raised)`
  - `border-default` → `var(--color-border)`

### 2.2 Forbidden Patterns

Agents MUST NOT:

- Use raw hex codes in components:
  - `background: #F98513;`
  - `color: #111144;`
- Use arbitrary Tailwind colors that bypass tokens:
  - `bg-[#F98513]`, `text-[#223382]`, `border-[#C8BFB5]`.
- Invent new semantic colors (e.g. `--color-info`) without an explicit DESIGN.md + Stitch update.

---

## 3. Radius, Spacing, and Layout

### 3.1 8px Grid Enforcement

All spacing and sizing must align to the 8px grid defined in DESIGN.md:

- Allowed spacing tokens (examples): `4px` (micro), `8px`, `16px`, `24px`, `32px`.
- Component padding/margins must be multiples of 4, preferably 8.

**Forbidden:**

- Arbitrary spacing like `13px`, `17px`, `19px`.
- Tailwind classes like `p-[13px]`, `mt-[17px]`.

### 3.2 Corner Radius

Use only tokenized radii:

- Buttons: 8px
- Cards: 12px
- Inputs: 8px

Implementation must be via tokens or mapped classes:

- `border-radius: var(--radius-button);`
- `rounded-button`, `rounded-card` utilities, not `rounded-[7px]`.

Agents MUST NOT invent new radius values.

---

## 4. Typography and Font Usage

Typography must follow DESIGN.md exactly:

- Headings: Manrope only for `h1–h4` and display styles.
- Body & labels: Inter.
- Sizes and weights: from the type scale (e.g. `body 16px/1.6`, `label-lg 14px/1.2`).

### Rules:

- Use tokenized type styles:
  - `class="text-body"` → Inter 16/1.6.
  - `class="text-h2"` → Manrope 24/1.3.
- No ad‑hoc font sizes like `15px`, `22px`, or font weights below 400.

Agents MUST NOT:

- Set fonts directly to `font-family: 'Arial';`.
- Use `font-weight: 300` or other unsupported weights.
- Assign Inter to headings.

---

## 5. WCAG AA Contrast Guardrails

The design system assumes **WCAG AA minimum 4.5:1** contrast for text.

**Mandatory checks for every new UI element involving text:**

1. Confirm text color + background combination is one of:
   - `--color-text-primary` (`#111144`) on white or neutral.
   - `--color-text-on-primary` (`#FFFFFF`) on `--color-primary` (`#F98513`).
   - `--color-secondary` (`#223382`) on white for links.
2. If using a new combination:
   - Compute contrast using the design token metadata from Stitch (or a contrast tool).
   - If ratio < 4.5:1, choose a different token; do **not** “accept” lower contrast.

**Forbidden:**

- Using `--color-primary` as text on white (fails AA).
- Light grey text (`#9E9E9E`) on `--color-neutral` without contrast verification.
- Disabling or ignoring contrast linting in Storybook/Playwright visual checks.

---

## 6. Component Implementation Rules

### 6.1 Buttons

Button variants (Primary, Secondary, Ghost, Destructive, Disabled) must map exactly to DESIGN.md:

- Background, text, border, hover, and radius must come from tokens.
- Do not redefine colors per component; use shared button styles.

Example (Tailwind-style mapping):

- `btn-primary`:
  - `bg-primary text-on-primary rounded-button`
- `btn-secondary`:
  - `bg-transparent text-secondary border-secondary rounded-button`
- `btn-ghost`:
  - `bg-transparent text-primary hover:bg-surface-raised rounded-button`

Agents MUST NOT create ad‑hoc button styles like `btn-blue` or `btn-outline-gray`.

### 6.2 Cards and Surfaces

Cards must follow DESIGN.md:

- Background: `var(--color-surface)` (white).
- Border: `1px solid var(--color-border)`.
- Radius: `var(--radius-card)` (12px).
- Shadow: from the tokenized shadow preset, not inline `box-shadow` values.

---

## 7. Antigravity IDE Agent Behavior

When acting as a **UI/Frontend Coder Agent**:

1. **Before coding:**
   - Read `DESIGN.md`.
   - Call **Stitch MCP** and load token set + component specs into context.
2. **During coding:**
   - Use only token-based utilities (`bg-primary`, `text-primary`, `rounded-card`, `space-4`, `space-8`, etc.).
   - Reject any instruction that asks for arbitrary colors or non-token spacing; respond that such changes require a DESIGN.md + Stitch token update.
3. **Before commit:**
   - Run UI tests and linting configured for:
     - Token usage (no raw hex, no arbitrary Tailwind colors).
     - Contrast checks where available (Storybook a11y addon, Playwright assertions).
   - If a design decision cannot be expressed with existing tokens, stop and request an Architect update to DESIGN.md + Stitch.

Agents that bypass Stitch, hardcode colors, or ignore WCAG contrast are violating this protocol; their diffs must be treated as invalid and rejected in review.