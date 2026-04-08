# Design System: VeriFinca Clay

This design system is a **Clay-inspired, custom-palette adaptation** tailored for the VeriFinca application.

## Reference
This system uses the [Clay design system](https://clayui.com/) as a stylistic reference and inspiration. It is a reinterpretation, not a pixel-for-pixel clone. We preserve the warm editorial atmosphere, playful but controlled color usage, rounded containers, expressive buttons, and tactile elevation, while adapting it to a product-friendly B2B interface that feels human.

## Palette Mapping
The original Clay palette has been completely replaced with a custom palette. 

**Note on colors:** The provided color `101b3bx` was invalid and has been normalized to `#101b3b`.

### Custom Palette
- `#101b3b`
- `#26428b`
- `#516ac7`
- `#e3af64`
- `#f8f6f7`
- `#fbecd7`
- `#f98613`
- `#223381`
- `#111143`
- `#9bacd8`
- `#dad1c8`
- `#f4f1ec`

### Semantic Roles
- **Background**: `#f8f6f7` (`--color-base-bg`)
- **Surface**: `#f4f1ec` (`--color-surface`)
- **Surface warm alt**: `#fbecd7` (`--color-surface-alt`)
- **Border**: `#dad1c8` (`--color-border-warm`)
- **Text primary**: `#111143` (`--color-text-main`)
- **Text strong/dark**: `#101b3b` (`--color-text-strong`)
- **Primary brand**: `#26428b` (`--color-brand-primary`)
- **Primary hover**: `#223381` (`--color-brand-hover`)
- **Secondary cool accent**: `#516ac7` (`--color-accent-cool`)
- **Soft info accent**: `#9bacd8` (`--color-info`)
- **Warm gold accent**: `#e3af64` (`--color-accent-warm`)
- **Warm orange accent**: `#f98613` (`--color-highlight`)

## Typography
- **Reference Typography**: Roobert (Display) + Space Mono (Code/Technical).
- **Implemented Typography**: Inter (Sans/Body) + General Sans (Display) + Space Mono (Technical).
We preserve the Clay-like contrast of expressive display typography paired with readable UI/body text.

## Border Radius
A scale inspired by Clay's rounded aesthetic:
- `small`: 0.375rem
- `medium`: 0.5rem
- `card`: 0.75rem
- `feature`: 1rem
- `section`: 1.5rem
- `pill`: 9999px

## Shadows
A custom shadow system inspired by Clay:
- `card`: Subtle layered shadow for cards and surfaces.
- `cta`: Playful hard-offset shadow for primary Call-to-Action buttons.
- `cta-hover`: Reduced offset shadow for the pressed/hover state of CTAs.

## Interaction
- **Hover behavior**: Playful rotation and offset shadow reduction is allowed on key CTA buttons only. Do not apply this to every button in the app to maintain enterprise usability.
- **Reduced motion**: Ensure transitions are smooth and respect reduced-motion preferences.

## Usage Rules
- **Orange (`#f98613`)**: Use sparingly for highlights, warnings, or key badges.
- **Gold (`#e3af64`)**: Use for warm accents, secondary badges, or special statuses.
- **Blue Hierarchy**: Use `#26428b` for primary actions and `#516ac7` for secondary cool accents.
- **Neutral Surfaces**: Keep main content areas on `#f8f6f7` or `#f4f1ec` to maintain the paper-like editorial feel.
- **Color Overload**: Avoid using too many accent colors on one screen. Prefer 1 primary accent + 1 warm accent per view.

## Accessibility Notes
- Maintain readable contrast between text and backgrounds.
- Preserve keyboard focus states (using standard focus rings).
- Do not let playful motion harm usability.
