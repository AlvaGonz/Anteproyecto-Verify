---

## 1. Visual Theme & Atmosphere

**Mood:** Warm, vibrant, and approachable. The interface blends energetic orange branding with a clean, light-mode canvas, projecting confidence without heaviness.

**Design Philosophy:**
- Light-first. Every surface defaults to warm neutrals. Dark variants are not in scope.
- Energy through accent. The primary orange drives all calls to action; the rest of the palette is intentionally restrained.
- Subtle roundedness. Not bubbly — refined. Corners hint at warmth but never feel cartoonish.
- Generous whitespace. Elements breathe. Crowding is a design error.

**Density:** Normal — comfortable for mixed content: dashboards, forms, content pages.

---

## 2. Color Palette & Roles

### Core Tokens

| Token | Hex | Role |
|---|---|---|
| `--color-primary` | `#F98513` | Brand anchor. CTAs, active states, primary buttons, key highlights |
| `--color-secondary` | `#223382` | Supporting actions, chips, secondary nav, icon fills |
| `--color-tertiary` | `#9BACD8` | Badges, decorative accents, inactive indicators, hover fills |
| `--color-neutral` | `#DAD1C8` | Page background, card surfaces, dividers, skeleton loaders |

### Extended Semantic Tokens (derived)

| Token | Value | Usage |
|---|---|---|
| `--color-surface` | `#FFFFFF` | Card, modal, input backgrounds |
| `--color-surface-raised` | `#F5F0EA` | Elevated panels, sidebars (warm tint of neutral) |
| `--color-text-primary` | `#1A1A1A` | All body text, headings |
| `--color-text-secondary` | `#5C5C5C` | Captions, placeholders, meta info |
| `--color-text-on-primary` | `#FFFFFF` | Text on `--color-primary` backgrounds |
| `--color-border` | `#C8BFB5` | Inputs, card outlines (darkened neutral) |
| `--color-primary-hover` | `#E07610` | Primary button hover state |
| `--color-primary-subtle` | `#FEF0E0` | Primary tint for alert backgrounds, selected rows |
| `--color-success` | `#2E7D32` | Confirmation states |
| `--color-error` | `#C62828` | Validation errors |
| `--color-warning` | `#F9A825` | Warnings (complements primary orange family) |

### Usage Rules
- **Never** use `--color-primary` as a text color on white — contrast ratio fails WCAG AA.
- **Always** pair `--color-primary` buttons with `--color-text-on-primary` (`#FFFFFF`) labels.
- `--color-secondary` on white passes WCAG AA; safe for body-level link text.
- `--color-neutral` as page background keeps the canvas warm without being distracting.

---

## 3. Typography Rules

### Font Stack

| Role | Family | Fallback |
|---|---|---|
| Headline | `Manrope` | `system-ui, sans-serif` |
| Body | `Inter` | `system-ui, sans-serif` |
| Label | `Inter` | `system-ui, sans-serif` |

### Type Scale

| Style | Font | Weight | Size | Line Height | Tracking | Usage |
|---|---|---|---|---|---|---|
| `display-xl` | Manrope | 800 | 56px | 1.1 | -0.02em | Hero headings |
| `display-lg` | Manrope | 700 | 40px | 1.15 | -0.02em | Page titles |
| `h1` | Manrope | 700 | 32px | 1.2 | -0.01em | Section headers |
| `h2` | Manrope | 600 | 24px | 1.3 | -0.01em | Card titles, subheaders |
| `h3` | Manrope | 600 | 20px | 1.4 | 0 | Widget titles |
| `h4` | Manrope | 600 | 16px | 1.4 | 0 | Small section headers |
| `body-lg` | Inter | 400 | 18px | 1.6 | 0 | Lead paragraph text |
| `body` | Inter | 400 | 16px | 1.6 | 0 | Default body text |
| `body-sm` | Inter | 400 | 14px | 1.5 | 0 | Supporting text, captions |
| `label-lg` | Inter | 500 | 14px | 1.2 | 0.01em | Button labels, form labels |
| `label` | Inter | 500 | 12px | 1.2 | 0.02em | Tags, chips, status badges |
| `overline` | Inter | 600 | 11px | 1 | 0.08em | Section eyebrows (uppercase) |

### Typography Rules
- Headings use Manrope exclusively. Never use Inter for H1–H4.
- Line lengths: 60–80 characters for body text columns.
- Do not use font weights below 400 in the UI.
- `overline` is always UPPERCASE.

---

## 4. Component Stylings

### Buttons

| Variant | Background | Text | Border | Hover | Radius |
|---|---|---|---|---|---|
| Primary | `#F98513` | `#FFFFFF` | none | `#E07610` | 8px |
| Secondary | `transparent` | `#223382` | 1.5px `#223382` | bg `#EEF0F8` | 8px |
| Ghost | `transparent` | `#1A1A1A` | none | bg `#F5F0EA` | 8px |
| Destructive | `#C62828` | `#FFFFFF` | none | `#A81F1F` | 8px |
| Disabled | `#DAD1C8` | `#9E9E9E` | none | — | 8px |

**Sizing:**
- `sm`: height 32px, padding `0 12px`, `label` font
- `md` (default): height 40px, padding `0 16px`, `label-lg` font
- `lg`: height 48px, padding `0 24px`, `label-lg` font, `font-size: 16px`

### Cards
background: #FFFFFF
border: 1px solid #C8BFB5
border-radius: 12px
padding: 24px
box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)

text

**Hover state (interactive cards):**
box-shadow: 0 4px 12px rgba(0,0,0,0.10)
border-color: #9BACD8
transition: all 150ms ease

text

### Inputs / Form Fields
height: 40px
background: #FFFFFF
border: 1.5px solid #C8BFB5
border-radius: 8px
padding: 0 12px
font: Inter 16px / 400
color: #1A1A1A

:focus → border-color: #F98513; outline: 3px solid rgba(249,133,19,0.2)
:error → border-color: #C62828
:disabled → background: #F5F0EA; color: #9E9E9E
placeholder → color: #9E9E9E

text

**Label:** Inter 500 14px, color `#1A1A1A`, margin-bottom `6px`
**Helper text:** Inter 400 12px, color `#5C5C5C`
**Error text:** Inter 400 12px, color `#C62828`

### Navigation
background: #FFFFFF
border-bottom: 1px solid #DAD1C8
height: 64px
padding: 0 24px

text

- Active nav link: `color: #F98513`, `font-weight: 600`
- Inactive nav link: `color: #5C5C5C`, hover `color: #1A1A1A`
- Logo/Brand mark: always uses `--color-primary` `#F98513`

### Badges / Chips

| Type | Background | Text | Border-radius |
|---|---|---|---|
| Primary | `#FEF0E0` | `#E07610` | 100px |
| Secondary | `#EEF0F8` | `#223382` | 100px |
| Tertiary | `#E8EBF5` | `#223382` | 100px |
| Success | `#E8F5E9` | `#2E7D32` | 100px |
| Error | `#FFEBEE` | `#C62828` | 100px |
| Neutral | `#F5F0EA` | `#5C5C5C` | 100px |

Height: 24px, padding `0 10px`, font `label` (Inter 500 12px)

---

## 5. Layout Principles

### Spacing Scale (base-8)

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Micro gaps, icon padding |
| `space-2` | 8px | Tight internal spacing |
| `space-3` | 12px | Compact list items |
| `space-4` | 16px | Default element spacing |
| `space-6` | 24px | Card padding, section gaps |
| `space-8` | 32px | Section separators |
| `space-12` | 48px | Major layout breaks |
| `space-16` | 64px | Page-level vertical rhythm |

### Grid

- Desktop: 12-column, `max-width: 1280px`, `margin: 0 auto`, `column-gap: 24px`, `padding: 0 32px`
- Tablet: 8-column, `padding: 0 24px`
- Mobile: 4-column, `padding: 0 16px`

### Whitespace Philosophy
- Content does not touch viewport edges. Minimum side padding is always `space-4` (16px).
- Vertical rhythm between sections: `space-12` (48px) minimum.
- Cards in a grid: `space-6` (24px) gap.

---

## 6. Depth & Elevation

| Level | CSS | Usage |
|---|---|---|
| Flat | `none` | Default surface, inline elements |
| Raised | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Cards, inputs |
| Floating | `0 4px 12px rgba(0,0,0,0.10)` | Dropdowns, hover cards |
| Modal | `0 16px 40px rgba(0,0,0,0.16)` | Modals, dialogs |
| Toast | `0 8px 24px rgba(0,0,0,0.12)` | Notifications, toasts |

- Shadows are **never colored** — always neutral `rgba(0,0,0,x)`.
- `--color-primary` never bleeds into shadows.
- Layer order: page → cards → dropdowns → modals → toasts.

---

## 7. Do's and Don'ts

### ✅ Do
- Use `#F98513` exclusively for primary CTAs and key brand moments.
- Apply Manrope for all headings (H1–H4) and page titles.
- Maintain 8px grid alignment on all spacing decisions.
- Use `border-radius: 8px` for interactive elements (buttons, inputs) and `12px` for containers (cards, modals).
- Ensure minimum 4.5:1 contrast ratio for all body text (WCAG AA).
- Keep `--color-neutral` (`#DAD1C8`) as the page background — never pure white.

### ❌ Don't
- Don't use `#F98513` as body/paragraph text on white.
- Don't mix Manrope and Inter within the same heading level.
- Don't add box-shadows with color tints (e.g., orange glow effects).
- Don't use border-radius values outside the system (no arbitrary `5px`, `15px`, etc.).
- Don't place two primary buttons side-by-side — secondary or ghost for the second action.
- Don't use font weights lighter than 400 anywhere in the UI.
- Don't use `--color-tertiary` (`#9BACD8`) as a primary action color — it's accent only.

---

## 8. Responsive Behavior

### Breakpoints

| Name | Min Width | Max Width |
|---|---|---|
| `xs` (mobile) | 0px | 639px |
| `sm` (mobile-lg) | 640px | 767px |
| `md` (tablet) | 768px | 1023px |
| `lg` (desktop) | 1024px | 1279px |
| `xl` (wide) | 1280px | — |

### Touch Targets
- Minimum interactive target: **44×44px** (Apple HIG / WCAG 2.5.5)
- On mobile, buttons stretch to `width: 100%` within their container.
- Navigation collapses to a hamburger menu at `< md` (768px).

### Collapsing Strategy
- Multi-column grids → single column at `xs`/`sm`.
- Sidebars → hidden drawer overlay on mobile.
- Data tables → horizontal scroll container with sticky first column.
- Nav bar → bottom tab bar or slide-in drawer on `xs`.

---

## 9. Agent Prompt Guide

### Quick Color Reference
Primary orange: #F98513 → All primary buttons, active states, brand logo
Secondary navy: #223382 → Secondary buttons, links, icon color
Tertiary slate: #9BACD8 → Badges, inactive chips, soft accents
Neutral warm: #DAD1C8 → Page background, dividers, skeleton
Surface white: #FFFFFF → Card, modal, input backgrounds
Text dark: #1A1A1A → All headings and body copy
Text muted: #5C5C5C → Captions and secondary labels