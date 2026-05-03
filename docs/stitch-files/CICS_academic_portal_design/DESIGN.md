---
name: CICS Academic Portal
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#89ceff'
  on-secondary: '#00344d'
  secondary-container: '#00a2e6'
  on-secondary-container: '#00344e'
  tertiary: '#dbb8ff'
  on-tertiary: '#3f2160'
  tertiary-container: '#a482c8'
  on-tertiary-container: '#381959'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#efdbff'
  tertiary-fixed-dim: '#dbb8ff'
  on-tertiary-fixed: '#29074a'
  on-tertiary-fixed-variant: '#573878'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 24px
  stack-lg: 48px
  section-padding: 80px
---

## Brand & Style

This design system bridges the gap between traditional academic prestige and the expansive, forward-thinking nature of modern research. It targets a diverse university demographic, from undergraduate students to high-level researchers, evoking a sense of "intellectual exploration."

The aesthetic is a hybrid of **Glassmorphism** and **Corporate Modernism**. In the cosmic-inspired dark mode, the UI utilizes translucent layers and subtle spectral glows to mirror the depth of a star-filled sky. In light mode, the system shifts toward a high-clarity, professional "Ivy League" digital feel, emphasizing clean whitespace and structured information architecture while retaining hints of the cosmic palette through refined accents.

## Colors

The palette is anchored by "Nebula Purple" and "Deep Space Blue." 

### Dark Mode (Cosmic)
The background uses a near-black violet base to allow UI elements to float. Primary actions utilize a linear gradient from violet to cyan, mimicking the energetic shift of celestial bodies. Borders are low-opacity white (10%) to define surfaces without creating visual noise.

### Light Mode (Academic)
The system transitions to a "Paper White" and "Oxford Blue" foundation. The purple and cyan accents are dialed back to 10-20% saturation for labels and interactive states, ensuring the interface remains accessible and serious for long-form reading and administrative tasks.

## Typography

This design system employs a three-tier typeface strategy to balance its dual identity. 

**Space Grotesk** is used for headlines, bringing a technical, geometric edge that aligns with the cosmic theme. **Inter** handles the heavy lifting for body copy and dense academic data, providing maximum legibility across all devices. **Manrope** is reserved for labels, navigation items, and micro-copy, offering a friendly yet professional tone that bridges the gap between the display and body fonts.

## Layout & Spacing

The layout utilizes a **12-column fixed grid** centered within a fluid container. This ensures that academic dashboards remain organized and predictable while allowing for high-impact "hero" sections to scale beautifully.

A 4px baseline grid governs all vertical rhythm. Large "Section Padding" is used to separate distinct modules (e.g., Course Overview from Research Updates), while tighter "Stack" spacing is used within component groups to maintain visual hierarchy. Gutters are generous at 24px to prevent the dense information typical of university portals from feeling claustrophobic.

## Elevation & Depth

Depth is communicated differently depending on the active color mode:

**In Dark Mode**, elevation is achieved through **Glassmorphism**. Higher-level surfaces use a 15% opacity blur and a subtle "inner glow" border (top and left edges only) to simulate light reflecting off a glass surface. 

**In Light Mode**, elevation follows a **Tonal Layering** approach. Surfaces are distinguished by subtle background color shifts (e.g., a light gray background with white cards). Ambient shadows are extremely soft—using a deep indigo tint at 4% opacity—to create a sense of lift without the "dirty" look of standard black shadows.

## Shapes

The shape language is "Calculated Softness." Corners use a medium radius (0.5rem) to feel modern and accessible, moving away from the harsh 90-degree angles of legacy educational software. 

Interactive elements like buttons and chips feature slightly more pronounced rounding to signify their "tappable" nature. Status indicators and profile avatars are circular to maintain the "celestial/orbital" theme found in the brand style.

## Components

### Buttons
- **Primary:** Gradient fill (Indigo to Cyan) with white text. High-elevation shadow in dark mode.
- **Secondary:** Ghost style with a thin themed border. 
- **Tertiary:** Text-only with a heavy underline on hover.

### Cards
Cards are the primary container for course modules and news. In dark mode, they must feature a `backdrop-filter: blur(12px)` and a `1px` stroke using the primary color at 20% opacity.

### Input Fields
Inputs should be large (48px height) with the label pinned above. In dark mode, the input background is 5% lighter than the page background to create a "recessed" feel.

### Chips & Badges
Used for course tags or status (e.g., "Active," "Graded"). These should use "Pill-shaped" (Level 3) roundedness and high-contrast, low-saturation color fills for accessibility.

### Progress Indicators
Radial progress bars are preferred for "Course Completion" metrics, reinforcing the circular/orbital visual motif.