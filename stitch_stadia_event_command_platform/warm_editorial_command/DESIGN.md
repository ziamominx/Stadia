---
name: Warm Editorial Command
colors:
  surface: '#f9f9f8'
  surface-dim: '#dadad9'
  surface-bright: '#f9f9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f3'
  surface-container: '#eeeeed'
  surface-container-high: '#e8e8e7'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1f0'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#2a1700'
  on-tertiary-container: '#b87500'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f9f9f8'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-xl:
    fontFamily: Hanken Grotesk
    fontSize: 56px
    fontWeight: '400'
    lineHeight: 60px
    letterSpacing: -0.035em
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.01em
  metric-stat:
    fontFamily: Hanken Grotesk
    fontSize: 44px
    fontWeight: '300'
    lineHeight: 48px
    letterSpacing: -0.04em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-micro:
    fontFamily: Hanken Grotesk
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.08em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: -0.01em
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers a calm, high-craft editorial aesthetic for mission-critical operations. Departing from ubiquitous military dark terminals, glowing sci-fi HUDs, and dense dashboard card walls, the design creates an atmosphere of intellectual clarity, control, and poise under pressure.

The target audience consists of stadium operations directors, public safety executives, and crowd flow engineers who require rapid situational awareness across tens of thousands of attendees. Rather than compounding operational stress with sensory overload, the interface acts as a silent, high-fidelity broadsheet: warm, tactile, structured, and profoundly legible.

Key tenets:
- **Architectural Negative Space:** Whitespace functions as structural hierarchy. Empty space isolates volatile telemetry, allowing anomalies to surface effortlessly without loud UI scaffolding.
- **Editorial Micro-Typographic Discipline:** Data points read like premium technical publishing, contrasting monumental metric counts with hairline dividers and tracked micro-labels.
- **Progressive Structural Disclosure:** Elements stay quiet and flush with the canvas until interacted with or escalated by live incident telemetry.

## Colors

The palette is rooted in an unyielding light-mode architecture, prioritizing reading comfort under bright command center lighting.

- **Canvas & Surfaces:**
  - Base Canvas: `#FBFBFA` (warm porcelain tone reducing optical glare).
  - Canvas Recessed: `#F7F7F5` (applied to structural gutters, fixed side-rails, and utility zones).
  - Canvas Elevated / Hover: `#FFFFFF` (isolated strictly for active editable fields, dropdowns, and flyout trays).
- **Ink & Contrast Hierarchy:**
  - Primary Typographic Ink: `#111111` (optically grounded near-black for key figures, headlines, and critical readings).
  - Secondary Reading Text: `#6E6E6E` (sub-headers, contextual metadata, and narrative summaries).
  - Muted Label Text: `#8E8E8E` (uppercase tracking tags, timestamp units, and peripheral grid labels).
- **Structural Lines:**
  - Hairline Border Default: `#EAEAE7` (1px non-distracting visual boundaries).
  - Hairline Border Subtle: `#E2E2DE` (active divides and nested sub-grids).
- **Semantic Signals:**
  - Active / Nominal Flow: `#10B981` (primary signal), `#059669` (hover / deep text tone).
  - Attention / Threshold Caution: `#F59E0B` (primary signal), `#D97706` (warning text tone).
  - Critical / Immediate Breach: `#EF4444` (primary signal), `#DC2626` (escalated alert tone).
  Semantic color is applied sparingly: as small 6px circular indicators, 1px perimeter state rules, or precise tabular text signals. It is never painted as expansive background fills.

## Typography

The typography pairs the sharp grotesque characteristics of Hanken Grotesk with the data-fidelity of JetBrains Mono for coordinates, turnstile hex counters, and incident serial numbers.

The hierarchy relies on dramatic scale contrast. Gigantic, light-weight metric figures anchor situational overviews, while all structural labeling is shifted to micro-scale uppercase text with generous letter tracking (`0.08em`). 

- Maintain tabular figures (`font-variant-numeric: tabular-nums;`) across all dynamic live feeds, crowd flow counters, and time indices.
- Never use heavy black weights; maximum weight is capped at 600 for micro-labels and 500 for headlines to preserve an airy, editorial tone.
- Large numerical stats use weight 300 to prevent optical density from overwhelming the surrounding UI.

## Layout & Spacing

Layouts follow a full-viewport, 100vw edge-to-edge structure governed by precision modular grid lines rather than floating islands.

- **Grid Architecture:** 
  - Desktop uses a continuous 12-column architectural grid with flush, single-pixel hairline grid seams (`#EAEAE7`) acting as the structural divide.
  - The master command view organizes information into fixed operational anchors: a permanent 64px macro navigation bar, a contextual 360px operational log rail, and a flex-dominant spatial canvas.
- **Rhythm & Safe Areas:**
  - Content relies on high-altitude interior padding (`space-xl` and `space-lg`) to prevent claustrophobic density during peak crowd events.
  - Telemetry cells use interior inset spacing of `space-md` horizontally and `space-md` vertically.
- **Responsive Adaptations:**
  - **Desktop (1440px+):** Edge-to-edge fluid 100vw multi-column layout with synchronous streaming panels.
  - **Tablet / Operations Field Slate (768px - 1439px):** Incident feed docks beneath the primary zone overview; structural gutter contracts to `1rem`.
  - **Mobile Handheld (320px - 767px):** Single-column stacked stream; gutters compress to `0.75rem`, margins to `1rem`; spatial heatmaps fold into high-level status lists.

## Elevation & Depth

This system eliminates artificial drop shadows, floating elevations, and frosted glass effects. The interface creates depth through deliberate flat planar shifts:

- **Surface Tiers:**
  - Level 0 (Recessed Foundation): `#F7F7F5` for base canvas, control rails, and spatial background.
  - Level 1 (Operational Planes): `#FBFBFA` for main analytical monitors and primary inspection grids.
  - Level 2 (Active Focus): `#FFFFFF` reserved exclusively for user-selected rows, modal command drawers, and popover tooltips.
- **Hairline Dividers:**
  - Depth boundaries are defined strictly through 1px border lines in `#EAEAE7`. Internal dividers collapse into shared single-pixel borders rather than double outlines.
- **Hover & Interaction Transitions:**
  - Elements do not lift upwards on the Z-axis. Hover states are communicated via immediate background shifts (e.g., `#FBFBFA` transitioning to `#F1F1ED`) and 1px border shifts to `#111111` or `#10B981`.
- **Alert Escalation Depth:**
  - Critical incidents surface without modal backdrops; instead, the 1px perimeter border of the affected sector shifts to `#EF4444`, complemented by a static 2px inset hairline indicator.

## Shapes

The design language uses zero-radius geometry (`0px`) across structural layout containers, modular zone panels, tabular data cells, operational drawers, and input controls. This crisp edge reflects architectural blueprints and broadsheet publications.

- **Standard Containers & Paneling:** All module containers, operational zones, and table headers are completely unrounded (`0px`).
- **Control Items & Micro-Elements:** Buttons, input fields, dropdown menus, and tabs feature strict right angles (`0px`).
- **Semantic Status Signals:** Status indicators are strictly circular (e.g., `width: 6px; height: 6px; border-radius: 50%`) to create maximum visual contrast against the surrounding orthogonal grid.

## Components

### Buttons
- **Primary Action:** Solid `#111111` background, `#FBFBFA` label text, `0px` radius, 36px height, uppercase `label-micro` typography. Hover: `#1A1A1A` with a 1px solid `#111111` inset.
- **Secondary / Ghost Action:** Transparent background, 1px hairline border `#EAEAE7`, `#111111` text. Hover: `#F7F7F5` background, `#111111` border.
- **Destructive / Emergency Dispatch:** `#FFFFFF` background, 1px solid `#EF4444` border, `#DC2626` text. Hover: `#EF4444` background, `#FFFFFF` text.

### Inputs & Select Fields
- Height 36px, `0px` radius, flush styling.
- Background `#FFFFFF`, border 1px solid `#EAEAE7`, text `#111111` in `body-sm`.
- Focus state: border color updates to `#111111` without focus rings or outline glows.
- Label: Placed outside or top-anchored in `label-micro`, color `#8E8E8E`.

### Cards & Zone Paneling
- Avoids floating shadow boxes. Cells are flat containers bounded by single-pixel hairline borders (`#EAEAE7`) sitting flush against the `#FBFBFA` canvas.
- Header zones contain an uppercase `label-micro` title, a subtle right-aligned tabular counter in `mono-data`, and a bottom border dividing header from content.

### Incident Chips & Tags
- Flat layout, zero radius, no soft colored pill fills.
- Formed by a 1px border matching the signal state:
  - Nominal: Border `#EAEAE7`, text `#059669`, with a 4px circular `#10B981` dot.
  - Attention: Border `#F59E0B`, text `#D97706`, with a 4px circular `#F59E0B` dot.
  - Critical: Border `#EF4444`, text `#DC2626`, with a 4px circular `#EF4444` dot.
- Padding: 2px 6px. Typography: `label-micro`.

### Lists & Telemetry Streams
- Row-based list format separated by 1px bottom borders in `#EAEAE7`.
- Hover row state shifts background to `#F7F7F5`.
- Selected row state switches background to `#FFFFFF` with a 2px left border accent in `#111111`.
- Columns are arranged using fixed widths, aligning figures to the right with `mono-data` typography.

### Checkboxes & Segmented Selectors
- Checkboxes: 14px by 14px, square, 1px border `#EAEAE7`, background `#FFFFFF`. Active checked state: filled `#111111` with a hairline white tick.
- Segmented Control: Connected container with 1px border `#EAEAE7`. Active tab: `#111111` text, `#FFFFFF` background, accompanied by a 1px baseline indicator. Inactive tab: `#6E6E6E` text, transparent background.

### Turnstile & Egress Gate Gauge (Specialized Component)
- Horizontal hairline bar showing flow capacity.
- Background rail: 2px height, `#EAEAE7`.
- Live flow fill: 2px height in `#10B981` (transitions to `#EF4444` when density exceeds 85%).
- Accompanying numeric values placed above the bar in `metric-stat` and `label-micro`.