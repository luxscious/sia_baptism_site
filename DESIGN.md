---
name: Sacred Bloom
colors:
  surface: "#fcf9f5"
  surface-dim: "#dcdad6"
  surface-bright: "#fcf9f5"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f6f3ef"
  surface-container: "#f0ede9"
  surface-container-high: "#eae8e4"
  surface-container-highest: "#e5e2de"
  on-surface: "#1c1c1a"
  on-surface-variant: "#45483d"
  inverse-surface: "#31302e"
  inverse-on-surface: "#f3f0ec"
  outline: "#76786c"
  outline-variant: "#c6c8ba"
  surface-tint: "#536436"
  primary: "#233209"
  on-primary: "#ffffff"
  primary-container: "#39491e"
  on-primary-container: "#a5b882"
  inverse-primary: "#bace96"
  secondary: "#745a35"
  on-secondary: "#ffffff"
  secondary-container: "#fedaab"
  on-secondary-container: "#785e39"
  tertiary: "#46222e"
  on-tertiary: "#ffffff"
  tertiary-container: "#5f3844"
  on-tertiary-container: "#d7a2b1"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#d6eab0"
  primary-fixed-dim: "#bace96"
  on-primary-fixed: "#121f00"
  on-primary-fixed-variant: "#3c4c21"
  secondary-fixed: "#ffddb2"
  secondary-fixed-dim: "#e3c194"
  on-secondary-fixed: "#291800"
  on-secondary-fixed-variant: "#5a4320"
  tertiary-fixed: "#ffd9e2"
  tertiary-fixed-dim: "#efb8c7"
  on-tertiary-fixed: "#31111c"
  on-tertiary-fixed-variant: "#633b47"
  background: "#fcf9f5"
  on-background: "#1c1c1a"
  surface-variant: "#e5e2de"
typography:
  display-name:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: "400"
    lineHeight: "1.2"
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 36px
    fontWeight: "400"
    lineHeight: "1.2"
    letterSpacing: 0.1em
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: "400"
    lineHeight: "1.3"
    letterSpacing: 0.05em
  body-lg:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: "400"
    lineHeight: "1.6"
  body-md:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.6"
  label-sm:
    fontFamily: Source Sans 3
    fontSize: 12px
    fontWeight: "600"
    lineHeight: "1"
    letterSpacing: 0.1em
  headline-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 28px
    fontWeight: "400"
    lineHeight: "1.2"
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1100px
  gutter: 24px
  margin-page: 5vw
  stack-sm: 1rem
  stack-md: 2rem
  stack-lg: 4rem
---

## Brand & Style

The design system is centered on a serene, spiritual, and sophisticated aesthetic tailored for a baptism celebration. It draws inspiration from classical botanical illustrations and traditional ecclesiastical typography.

The personality is **elegant, airy, and celebratory**. It prioritizes a sense of "preciousness" through ample whitespace (breathing room), high-quality serif typography, and delicate watercolor textures. The target audience includes family and friends who seek a digital experience that feels as personal and formal as a physical stationery invitation.

The visual style is **Contemporary Classical**, blending clean minimalism with organic, tactile watercolor elements. It utilizes floral motifs as structural anchors rather than mere decoration, creating a fluid transition between physical tradition and digital utility.

## Colors

The palette is rooted in nature and tradition.

- **Primary (#39491E):** A deep, olive-toned evergreen used for body text and primary actions, providing a grounded, organic feel.
- **Secondary (#A88A61):** A muted gold/brass hue for headings and celebratory accents, reflecting the dignity of the ceremony.
- **Accent Pinks:** A gradient of dusty roses used for decorative elements, hover states, and softer UI components.
- **Neutral (#F9F6F2):** A warm, paper-like off-white is used for the background to avoid the harshness of pure white and enhance the watercolor aesthetic.

## Typography

This design system employs a three-tier typographic hierarchy to mirror the formal invitation structure:

- Palatino linotype font is join us to celebrate
- tranjanpro regular and allura (her name)

3.  **Body (Source Serif 4):** A highly legible, modern serif for all functional information, addresses, and RSVP instructions.
4.  **Labels (Source Sans 3):** A clean sans-serif for form labels and utility text to ensure clarity in the interactive portions of the site.

## Layout & Spacing

The layout follows a **Fixed-Fluid hybrid grid**. Content is centered within a maximum width of 1100px to maintain an editorial feel, while watercolor assets are permitted to bleed off the edges of the viewport to create an immersive, unboxed environment.

- **Vertical Rhythm:** Large vertical gaps (`stack-lg`) between major sections (Invitation, Details, RSVP) are essential to maintain the "airy" feel.
- **Asymmetry:** Floral elements should be placed asymmetrically (e.g., top-left and bottom-right) to mimic the organic growth seen in the invitation.
- **Mobile:** On smaller screens, margins increase slightly to ensure text does not collide with decorative floral borders.

## Elevation & Depth

To maintain a "paper" aesthetic, traditional drop shadows are avoided. Instead, depth is created through:

- **Tonal Layering:** Using `#F2D8D5` (Soft Pink) as a subtle background fill for cards and form containers to lift them from the neutral background.
- **Transparency:** Watercolor assets should use "Multiply" or "Color Burn" blending modes where possible to appear as if they are absorbed into the digital paper.
- **Soft Outlines:** Form fields and cards use very thin (1px) borders in `#A88A61` at 30% opacity, providing structure without visual weight.

## Shapes

The shape language is primarily **Soft and Organic**.

While the layout is structured, interactive elements like buttons and input fields use a subtle 4px (`rounded-sm`) radius. This provides just enough softness to feel approachable without losing the formal, high-end stationery feel. Large imagery or watercolor highlights should utilize irregular, organic masking rather than hard geometric boxes.

## Components

### Buttons

- **Primary:** Solid `#39491E` with white text. High-contrast, uppercase `label-sm` typography.
- **Secondary:** Outlined in `#A88A61`. No fill. Used for "Add to Calendar" or secondary actions.
- **Interaction:** On hover, primary buttons shift to `#BC8A98` with a soft 200ms transition.

### Input Fields

- Underlined style or very light bordered boxes. Label text uses `label-sm` in primary green.
- Focus state: Border color shifts to secondary gold with a very faint pink glow (no blur).

### Cards (Information Blocks)

- Used for "Ceremony" and "Lunch" details.
- No shadow. Uses a light pink wash (`#F2D8D5` at 20% opacity) or a simple thin gold border to define the area.

### Chips/Tags

- Used for dietary requirements or guest counts.
- Rounded pill shapes in `#F2D8D5` with `#39491E` text.

### Floral Accents

- Not a standard component, but a recurring architectural element. Use high-resolution PNGs of watercolors at the corners of the main container and as separators between sections.
