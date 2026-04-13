# design.md — UI Design System

---

## 1. Visual Theme & Atmosphere

**Mood:** Warm, vibrant, and approachable. The interface blends energetic
orange branding with a clean, light-mode canvas, projecting confidence
without heaviness.

**Design Philosophy:**
- Light-first. Every surface defaults to warm neutrals. Dark variants are
  not in scope.
- Energy through accent. The primary orange drives all calls to action;
  the rest of the palette is intentionally restrained.
- Subtle roundedness. Not bubbly — refined. Corners hint at warmth but
  never feel cartoonish.
- Generous whitespace. Elements breathe. Crowding is a design error.

**Density:** Normal — comfortable for mixed content: dashboards, forms,
content pages.

---

## 2. Color Palette & Roles

### Palette Source — MP113

| Name              | Hex       | Contrast | Origin Token        |
|-------------------|-----------|----------|---------------------|
| Luster White      | `#F4F1EC` | 18.64:1  | Surface Raised      |
| Aster Flower Blue | `#9BACD8` | 9.29:1   | Tertiary            |
| Habañero          | `#F98513` | 8.39:1   | Primary             |
| Jodhpur Tan       | `#DAD1C8` | 13.94:1  | Neutral             |
| Deep Space Royal  | `#223382` | 11.27:1  | Secondary           |
| Deadly Depths     | `#111144` | 17.68:1  | Text Primary / Dark |

> Contrast ratios measured against white (#FFFFFF) as reported in the
> MP113 palette card.

---

### Core Tokens

| Token               | Hex       | Role                                                        |
|---------------------|-----------|-------------------------------------------------------------|
| `--color-primary`   | `#F98513` | Brand anchor. CTAs, active states, primary buttons, key highlights |
| `--color-secondary` | `#223382` | Supporting actions, chips, secondary nav, icon fills        |
| `--color-tertiary`  | `#9BACD8` | Badges, decorative accents, inactive indicators, hover fills|
| `--color-neutral`   | `#DAD1C8` | Page background, card surfaces, dividers, skeleton loaders  |

### Extended Semantic Tokens (derived)

| Token                    | Value     | Usage                                              |
|--------------------------|-----------|----------------------------------------------------|
| `--color-surface`        | `#FFFFFF` | Card, modal, input backgrounds                     |
| `--color-surface-raised` | `#F4F1EC` | Elevated panels, sidebars (Luster White)           |
| `--color-text-primary`   | `#111144` | All body text, headings (Deadly Depths)            |
| `--color-text-secondary` | `#5C5C5C` | Captions, placeholders, meta info                  |
| `--color-text-on-primary`| `#FFFFFF` | Text on `--color-primary` backgrounds              |
| `--color-border`         | `#C8BFB5` | Inputs, card outlines (darkened Jodhpur Tan)       |
| `--color-primary-hover`  | `#E07610` | Primary button hover state                         |
| `--color-primary-subtle` | `#FEF0E0` | Alert backgrounds, selected rows                   |
| `--color-success`        | `#2E7D32` | Confirmation states                                |
| `--color-error`          | `#C62828` | Validation errors                                  |
| `--color-warning`        | `#F9A825` | Warnings (complements Habañero orange family)      |

### Usage Rules
- **Never** use `--color-primary` (`#F98513`) as text on white — contrast
  fails WCAG AA.
- **Always** pair primary buttons with `--color-text-on-primary`
  (`#FFFFFF`) labels.
- `--color-secondary` (`#223382`) on white passes WCAG AA; safe for
  body-level link text.
- `--color-neutral` (`#DAD1C8`) as page background keeps the canvas warm
  without being distracting.
- `--color-text-primary` is now `#111144` (Deadly Depths) — deeper than
  standard near-black, maintains 17.68:1 contrast against white.

---

## 3. Typography Rules

### Font Stack

| Role     | Family    | Fallback              |
|----------|-----------|-----------------------|
| Headline | `Manrope` | `system-ui, sans-serif` |
| Body     | `Inter`   | `system-ui, sans-serif` |
| Label    | `Inter`   | `system-ui, sans-serif` |

### Type Scale

| Style        | Font    | Weight | Size  | Line Height | Tracking | Usage               |
|--------------|---------|--------|-------|-------------|----------|---------------------|
| `display-xl` | Manrope | 800    | 56px  | 1.1         | -0.02em  | Hero headings       |
| `display-lg` | Manrope | 700    | 40px  | 1.15        | -0.02em  | Page titles         |
| `h1`         | Manrope | 700    | 32px  | 1.2         | -0.01em  | Section headers     |
| `h2`         | Manrope | 600    | 24px  | 1.3         | -0.01em  | Card titles         |
| `h3`         | Manrope | 600    | 20px  | 1.4         | 0        | Widget titles       |
| `h4`         | Manrope | 600    | 16px  | 1.4         | 0        | Small section heads |
| `body-lg`    | Inter   | 400    | 18px  | 1.6         | 0        | Lead paragraph      |
| `body`       | Inter   | 400    | 16px  | 1.6         | 0        | Default body        |
| `body-sm`    | Inter   | 400    | 14px  | 1.5         | 0        | Captions            |
| `label-lg`   | Inter   | 500    | 14px  | 1.2         | 0.01em   | Button/form labels  |
| `label`      | Inter   | 500    | 12px  | 1.2         | 0.02em   | Tags, chips, badges |
| `overline`   | Inter   | 600    | 11px  | 1           | 0.08em   | Section eyebrows    |

### Typography Rules
- Headings use Manrope exclusively. Never Inter for H1–H4.
- Line lengths: 60–80 characters for body text columns.
- Do not use font weights below 400.
- `overline` is always UPPERCASE.
- All heading color defaults to `--color-text-primary` (`#111144`).

---

## 4. Component Stylings

### Buttons

| Variant     | Background | Text      | Border          | Hover     | Radius |
|-------------|------------|-----------|-----------------|-----------|--------|
| Primary     | `#F98513`  | `#FFFFFF` | none            | `#E07610` | 8px    |
| Secondary   | transparent| `#223382` | 1.5px `#223382` | bg `#EEF0F8` | 8px |
| Ghost       | transparent| `#111144` | none            | bg `#F4F1EC` | 8px |
| Destructive | `#C62828`  | `#FFFFFF` | none            | `#A81F1F` | 8px    |
| Disabled    | `#DAD1C8`  | `#9E9E9E` | none            | —         | 8px    |

> Ghost button text updated to `#111144` (Deadly Depths) for maximum
> legibility on the warm neutral canvas.

**Sizing:**
- `sm`: height 32px, padding `0 12px`, `label` font
- `md` (default): height 40px, padding `0 16px`, `label-lg` font
- `lg`: height 48px, padding `0 24px`, `label-lg` font, `font-size: 16px`

---

### Cards

```css
background: #FFFFFF;
border: 1px solid #C8BFB5;
border-radius: 12px;
padding: 24px;
box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
```

**Hover state (interactive cards):**

```css
box-shadow: 0 4px 12px rgba(0,0,0,0.10);
border-color: #9BACD8; /* Aster Flower Blue */
transition: all 150ms ease;
```

---

### Inputs / Form Fields

```css
height: 40px;
background: #FFFFFF;
border: 1.5px solid #C8BFB5;
border-radius: 8px;
padding: 0 12px;
font: Inter 16px / 400;
color: #111144; /* Deadly Depths */
```

```css
:focus  → border-color: #F98513; outline: 3px solid rgba(249,133,19,0.2);
:error  → border-color: #C62828;
:disabled → background: #F4F1EC; color: #9E9E9E; /* Luster White bg */
placeholder → color: #9E9E9E;
```

**Label:** Inter 500 14px, color `#111144`, margin-bottom `6px`
**Helper text:** Inter 400 12px, color `#5C5C5C`
**Error text:** Inter 400 12px, color `#C62828`

---

### Navigation

```css
background: #FFFFFF;
border-bottom: 1px solid #DAD1C8; /* Jodhpur Tan */
height: 64px;
padding: 0 24px;
```

- Active nav link: `color: #F98513`, `font-weight: 600`
- Inactive nav link: `color: #5C5C5C`, hover `color: #111144`
- Logo/Brand mark: always `#F98513` (Habañero)

---

### Badges / Chips

| Type      | Background | Text      | Border-radius |
|-----------|------------|-----------|---------------|
| Primary   | `#FEF0E0`  | `#E07610` | 100px         |
| Secondary | `#EEF0F8`  | `#223382` | 100px         |
| Tertiary  | `#E8EBF5`  | `#223382` | 100px         |
| Success   | `#E8F5E9`  | `#2E7D32` | 100px         |
| Error     | `#FFEBEE`  | `#C62828` | 100px         |
| Neutral   | `#F4F1EC`  | `#5C5C5C` | 100px         |

> Neutral badge background updated to `#F4F1EC` (Luster White).

Height: 24px, padding `0 10px`, font `label` (Inter 500 12px)

---

## 5. Layout Principles

### Spacing Scale (base-8)

| Token     | Value | Usage                       |
|-----------|-------|-----------------------------|
| `space-1` | 4px   | Micro gaps, icon padding    |
| `space-2` | 8px   | Tight internal spacing      |
| `space-3` | 12px  | Compact list items          |
| `space-4` | 16px  | Default element spacing     |
| `space-6` | 24px  | Card padding, section gaps  |
| `space-8` | 32px  | Section separators          |
| `space-12`| 48px  | Major layout breaks         |
| `space-16`| 64px  | Page-level vertical rhythm  |

### Grid

- Desktop: 12-column, `max-width: 1280px`, `margin: 0 auto`,
  `column-gap: 24px`, `padding: 0 32px`
- Tablet: 8-column, `padding: 0 24px`
- Mobile: 4-column, `padding: 0 16px`

### Whitespace Philosophy
- Content does not touch viewport edges. Minimum side padding: `space-4`
  (16px).
- Vertical rhythm between sections: `space-12` (48px) minimum.
- Cards in a grid: `space-6` (24px) gap.

---

## 6. Depth & Elevation

| Level    | CSS                                                              | Usage                  |
|----------|------------------------------------------------------------------|------------------------|
| Flat     | `none`                                                           | Default surface        |
| Raised   | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`       | Cards, inputs          |
| Floating | `0 4px 12px rgba(0,0,0,0.10)`                                    | Dropdowns, hover cards |
| Modal    | `0 16px 40px rgba(0,0,0,0.16)`                                   | Modals, dialogs        |
| Toast    | `0 8px 24px rgba(0,0,0,0.12)`                                    | Notifications          |

- Shadows are **never colored** — always `rgba(0,0,0,x)`.
- `--color-primary` never bleeds into shadows.
- Layer order: page → cards → dropdowns → modals → toasts.

---

## 7. Do's and Don'ts

### ✅ Do
- Use `#F98513` (Habañero) exclusively for primary CTAs and brand moments.
- Use `#111144` (Deadly Depths) for all body text and headings.
- Use `#F4F1EC` (Luster White) for elevated surface backgrounds and
  disabled input fills.
- Apply Manrope for all headings (H1–H4) and page titles.
- Maintain 8px grid alignment on all spacing decisions.
- Use `border-radius: 8px` for interactive elements and `12px` for
  containers.
- Ensure minimum 4.5:1 contrast ratio for all body text (WCAG AA).
- Keep `--color-neutral` (`#DAD1C8`, Jodhpur Tan) as the page background.

### ❌ Don't
- Don't use `#F98513` as body/paragraph text on white.
- Don't use `#1A1A1A` — replaced by `#111144` (Deadly Depths) throughout.
- Don't use `#F5F0EA` — replaced by `#F4F1EC` (Luster White) throughout.
- Don't mix Manrope and Inter within the same heading level.
- Don't add box-shadows with color tints (no orange glow effects).
- Don't use border-radius values outside the system (no `5px`, `15px`).
- Don't place two primary buttons side-by-side.
- Don't use font weights lighter than 400.
- Don't use `--color-tertiary` (`#9BACD8`) as a primary action color.

---

## 8. Responsive Behavior

### Breakpoints

| Name            | Min Width | Max Width |
|-----------------|-----------|-----------|
| `xs` (mobile)   | 0px       | 639px     |
| `sm` (mobile-lg)| 640px     | 767px     |
| `md` (tablet)   | 768px     | 1023px    |
| `lg` (desktop)  | 1024px    | 1279px    |
| `xl` (wide)     | 1280px    | —         |

### Touch Targets
- Minimum interactive target: **44×44px** (Apple HIG / WCAG 2.5.5)
- On mobile, buttons stretch to `width: 100%` within their container.
- Navigation collapses to hamburger at `< md` (768px).

### Collapsing Strategy
- Multi-column grids → single column at `xs`/`sm`.
- Sidebars → hidden drawer overlay on mobile.
- Data tables → horizontal scroll with sticky first column.
- Nav bar → bottom tab bar or slide-in drawer on `xs`.

---

## 9. Agent Prompt Quick Reference
// MP113 Palette — Full Token Map
--color-primary: #F98513 /* Habañero — CTAs, brand logo */
--color-secondary: #223382 /* Deep Space Royal — secondary actions */
--color-tertiary: #9BACD8 /* Aster Flower Blue — badges, accents */
--color-neutral: #DAD1C8 /* Jodhpur Tan — page bg, dividers */
--color-surface: #FFFFFF /* Pure White — card/modal/input bg */
--color-surface-raised: #F4F1EC /* Luster White — elevated panels */
--color-text-primary: #111144 /* Deadly Depths — all text/headings */
--color-text-secondary: #5C5C5C /* Muted — captions, meta */
--color-text-on-primary:#FFFFFF /* On orange bg — button labels */
--color-border: #C8BFB5 /* Darkened Jodhpur — inputs, outlines */
--color-primary-hover: #E07610 /* Darker Habañero — button hover */
--color-primary-subtle: #FEF0E0 /* Light Habañero — alert bg, rows */
--color-success: #2E7D32
--color-error: #C62828
--color-warning: #F9A825

