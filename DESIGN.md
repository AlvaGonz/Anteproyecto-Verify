# DESIGN.md

## Official Color Palette

Single source of truth for all project colors. Any color used in frontend, admin, public views, badges, alerts, or status indicators must come from this palette.

## Brand Intent

- Legal trust
- Technical clarity
- Institutional seriousness
- Warmth without losing professionalism

## Official Tokens

| Token | Hex | Purpose |
|---|---|---|
| brand-primary | #2c3b4e | Main brand, primary buttons, nav, headers |
| brand-primary-hover | #1e223d | Hover / pressed state for primary actions |
| brand-secondary | #a35139 | Secondary accent, institutional highlight |
| brand-accent | #f54f1b | Strong CTA, critical alerts |
| brand-accent-soft | #feb161 | Badges, soft highlights, warm emphasis |
| surface-base | #ede9de | Default app / page background |
| surface-alt | #e6d5b7 | Cards, panels, grouped content |
| surface-muted | #c9c1b2 | Borders, dividers, disabled backgrounds |
| text-strong | #1c2632 | Main text, headings, dense UI |
| text-on-dark | #ede9de | Text on dark / brand surfaces |

## Usage Rules

### Buttons
- Primary: bg `brand-primary`, text `text-on-dark`
- Primary hover: bg `brand-primary-hover`
- Secondary: bg `surface-alt`, text `text-strong`, border `surface-muted`
- Destructive/emphasis: bg `brand-accent`, text `text-on-dark`

### Surfaces
- App background: `surface-base`
- Cards / panels: `surface-alt`
- Borders / dividers: `surface-muted`

### Accents
- Use `brand-accent` sparingly — only for critical calls to action
- Use `brand-accent-soft` for status pills and informational states
- Use `brand-secondary` as restrained secondary, not dominant UI color

## Accessibility Rules

- Never use accent colors as the only source of meaning
- `text-strong` on light surfaces
- `text-on-dark` on dark/brand surfaces
- Avoid long paragraph text in accent colors
- Maintain strong contrast on buttons, links, status labels

## Status Mapping

| State | Background | Text |
|---|---|---|
| Neutral / In Review | surface-muted | text-strong |
| Attention | brand-accent-soft | text-strong |
| Critical | brand-accent | text-on-dark |
| Authority surface | brand-primary | text-on-dark |

## Prohibitions

- Do not introduce unrelated blues, purples, or neon accents
- Do not mix random grayscale with warm neutrals
- Do not use `brand-accent` as a global background
- Do not hardcode hex values inside components

## Future Dark Mode

Derive dark surfaces from:
- `brand-primary-hover` as dark background
- `brand-primary` as surface layer
- `text-on-dark` as text

while preserving the same semantic token mapping.
