## Design System: VeriFinca

### Pattern
- **Name:** Before-After Transformation
- **Conversion Focus:** Visual proof of value. 45% higher conversion. Real results. Specific metrics. Guarantee offer.
- **CTA Placement:** After transformation reveal + Bottom
- **Color Strategy:** Contrast: muted/grey (before) vs vibrant/colorful (after). Success green for results.
- **Sections:** 1. Hero (problem state), 2. Transformation slider/comparison, 3. How it works, 4. Results CTA

### Style
- **Name:** Minimalism & Swiss Style
- **Keywords:** Clean, simple, spacious, functional, white space, high contrast, geometric, sans-serif, grid-based, essential
- **Best For:** Enterprise apps, dashboards, documentation sites, SaaS platforms, professional tools
- **Performance:** ΓÜí Excellent | **Accessibility:** Γ£ô WCAG AAA

### Colors
| Role | Hex |
|------|-----|
| Primary | #0F766E |
| Secondary | #14B8A6 |
| CTA | #0369A1 |
| Background | #F0FDFA |
| Text | #134E4A |

*Notes: Trust Blue (#0077B6) + Gold accents + White*

### Typography
- **Heading:** Cinzel
- **Body:** Josefin Sans
- **Mood:** real estate, luxury, elegant, sophisticated, property, premium
- **Best For:** Real estate, luxury properties, architecture, interior design
- **Google Fonts:** https://fonts.google.com/share?selection.family=Cinzel:wght@400;500;600;700|Josefin+Sans:wght@300;400;500;600;700
- **CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Josefin+Sans:wght@300;400;500;600;700&display=swap');
```

### Key Effects
Subtle hover (200-250ms), smooth transitions, sharp shadows if any, clear type hierarchy, fast loading

### Avoid (Anti-patterns)
- Poor photos
- No virtual tours

### Pre-Delivery Checklist
- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px

