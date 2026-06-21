---
name: Lumina Grid
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#b9cbb9'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#849585'
  outline-variant: '#3b4b3d'
  surface-tint: '#00e479'
  primary: '#f1ffef'
  on-primary: '#003919'
  primary-container: '#00ff88'
  on-primary-container: '#007139'
  inverse-primary: '#006d37'
  secondary: '#bdf4ff'
  on-secondary: '#00363d'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#fcfaff'
  on-tertiary: '#283044'
  tertiary-container: '#d6def8'
  on-tertiary-container: '#5a6178'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#60ff99'
  primary-fixed-dim: '#00e479'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005228'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  label-caps:
    fontFamily: Space Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.15em
  metric-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  unit: 8px
---

## Brand & Style

The design system is a high-fidelity visual framework engineered for the elite sector of electric vehicle infrastructure. It embodies a "Dark Luxury" aesthetic, merging the precision of high-end hardware interfaces with the fluid intelligence of advanced AI.

The design style is a sophisticated blend of **Glassmorphism** and **High-Contrast Neon**. It leverages deep-space blacks to provide an infinite canvas where data and metrics appear as illuminated physical objects. The emotional goal is to evoke a sense of absolute control, technological superiority, and premium reliability. Every element should feel like it was machined from high-grade carbon and glass, then powered by a subterranean electrical current.

## Colors

The palette is anchored in `#050505` to ensure maximum contrast and eliminate light bleed, creating a true "dark luxury" environment. 

- **Primary Green (#00FF88):** "Electric Neon." Used for active states, successful charging connections, and critical growth metrics.
- **Secondary Green (#00D97E):** Used for subtle gradients and state shifts to provide depth to primary actions.
- **Accent Cyan (#00E5FF):** Represents the AI intelligence layer. Used for data visualizations, predictive paths, and technological indicators.
- **Surface Palette:** Layers are built using `#0F172A` with varying levels of opacity to create a sense of structural hierarchy without relying on heavy borders.
- **Typography:** Primary text is pure `#FFFFFF` for readability, while `#94A3B8` is used for metadata to maintain focus on key figures.

## Typography

This design system utilizes a trio of typefaces to achieve a technical yet premium feel. 

**Geist** is the primary driver for headlines and display metrics, chosen for its surgical precision and "developer-luxury" vibe. **Inter** handles the heavy lifting for body copy and dense data sets due to its unmatched legibility. **Space Mono** is used sparingly for labels, tags, and "machine-read" data points (like serial numbers or kilowatt hours) to reinforce the futuristic EV theme.

Headlines should utilize wide tracking in uppercase variants and tight tracking in display sizes to emphasize the scale of the platform.

## Layout & Spacing

The layout follows a **Fluid Grid** philosophy with a fixed maximum container width of 1440px to ensure a curated, dashboard-like experience on ultra-wide monitors. 

- **Desktop (12 Columns):** 64px outer margins with 24px gutters. Content is organized in "pods" (glassmorphic cards) that span 3, 4, 6, or 12 columns.
- **Tablet (8 Columns):** 32px outer margins with 16px gutters. Sidebar collapses into a hover-rail.
- **Mobile (4 Columns):** 20px outer margins. High-priority metrics stack vertically.

The spacing rhythm is strictly 8px-based. All paddings and margins must be multiples of 8 to maintain the mathematical precision expected of a high-tech infrastructure product.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Luminescent Accents** rather than traditional drop shadows.

1.  **Floor (#050505):** The base canvas.
2.  **Mantle (#0F172A):** Used for large structural containers like sidebars.
3.  **Glass Layer:** `rgba(255, 255, 255, 0.03)` with a 20px backdrop-blur. This is used for interactive cards and floating modals.
4.  **The Glow:** Active or highlighted elements utilize a `0px 0px 20px rgba(0, 255, 136, 0.15)` outer glow to simulate light emission from an OLED screen.

Borders are used to define shape, utilizing a `1px solid rgba(255, 255, 255, 0.08)` stroke. For primary elements, a gradient border (Top-Left to Bottom-Right) from white to transparent adds a "shimmer" effect.

## Shapes

The shape language is "Calculated Softness." Elements utilize a 0.5rem (8px) base radius to feel modern and accessible, while avoiding the overly "bubbly" look of consumer social apps. 

Large dashboard cards and glassmorphic containers use `rounded-xl` (1.5rem / 24px) to create a clear visual distinction between the frame and the content. Inner elements like buttons and input fields stay at the 8px base to maintain a technical, modular appearance.

## Components

### Buttons
- **Primary:** Solid `#00FF88` background with black text. Hover state includes a 15px neon glow.
- **Secondary:** Ghost style with a `1px solid rgba(255,255,255,0.2)` border. On hover, the border illuminates to solid white.
- **Ghost:** Pure text with `Space Mono` font, used for low-priority actions.

### Cards (Glassmorphic)
Dashboard cards must use a `background: rgba(255, 255, 255, 0.03)` with `backdrop-filter: blur(12px)`. They feature a 1px top-light border to catch the "ceiling light" of the UI.

### Interactive Metrics
Large numbers (KWh, Revenue, Uptime) use `Geist` bold. When metrics update, they should utilize a subtle vertical slide-in animation to suggest a rolling counter.

### Input Fields
Dark backgrounds (`#0F172A`) with a subtle `rgba(255,255,255,0.05)` inset shadow. The focus state shifts the border color to Cyan `#00E5FF` with a faint outer glow.

### Charts & Maps
Use `Recharts` with custom styling. Lines should be `Primary Green` with a subtle gradient area fill underneath. Map pins are represented by glowing pulses of light rather than static icons.