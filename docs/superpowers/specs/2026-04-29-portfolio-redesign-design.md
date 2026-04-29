# Portfolio Redesign — Design Spec

**Date:** 2026-04-29  
**Project:** mikhaelcodes.dev — full redesign  
**Output path:** `/Users/mikhael/Documents/Projects/portfolio`

---

## 1. Overview

A complete rebuild of Mikhael Opeyemi-Olatunji's personal portfolio from scratch. The aesthetic is inspired by Stripe, Apple, and Spade — premium editorial feel with deliberate use of whitespace, strong typography, and a 3D interactive hero. Clean break from the existing pages-router JS site.

**Stack:** Next.js 15 App Router · TypeScript · React Three Fiber v8 (React 18) · Three.js · Framer Motion · Lenis · Plus Jakarta Sans

---

## 2. Color System

Two themes via `data-theme` attribute on `<html>`. All values exposed as CSS custom properties.

### Light (`data-theme="light"`)
```
--bg:        #FAFAF9
--bg-alt:    #F5F3F0
--surface:   #FFFFFF
--text:      #111110
--text-muted:#6B6560
--text-dim:  #C0BCB7
--border:    rgba(0,0,0,0.07)
--border-mid:rgba(0,0,0,0.13)
--accent:    #B9314F
--accent2:   #C8601A
--accent-glow: rgba(185,49,79,0.09)
--chip-bg:   rgba(0,0,0,0.04)
```

### Dark (`data-theme="dark"`)
```
--bg:        #0D0C0B
--bg-alt:    #131210
--surface:   #1C1917
--text:      #F0EDE8
--text-muted:#7A7268
--text-dim:  #3D3A37
--border:    rgba(255,255,255,0.07)
--border-mid:rgba(255,255,255,0.13)
--accent:    #C94060
--accent2:   #D5813A
--accent-glow: rgba(201,64,96,0.12)
--chip-bg:   rgba(255,255,255,0.05)
```

Theme stored in `localStorage` key `portfolio-theme`. Blocking init script in `app/layout.tsx` prevents flash-of-wrong-theme.

---

## 3. Typography

**Font:** Plus Jakarta Sans (weights 300, 400, 500, 600, 700, 800) via `next/font/google`.

Scale:
- Display / hero headline: `clamp(48px, 7vw, 88px)`, weight 800, tracking `-0.045em`
- Section title: `clamp(36px, 4.5vw, 56px)`, weight 800, tracking `-0.035em`
- Body: `15px`, weight 400, line-height `1.8`
- Eyebrow: `11px`, weight 600, tracking `0.14em`, uppercase, `var(--accent)`
- Stat values: `36px`, weight 800, tracking `-0.04em`, gradient fill

---

## 4. Layout & Navigation

**Nav (sticky, top):**
- Logo: `Mikhael.` — dot in `var(--accent)`
- Links: About · Work · Experience · Contact
- Resume button (right): links to `/resume.pdf`
- Frosted glass: `backdrop-filter: blur(20px)` + 92% bg opacity

**Smooth scroll:** Lenis wraps the entire page. `ScrollTrigger` from GSAP is NOT used — Framer Motion `useInView` handles scroll-triggered animations.

**Theme toggle:** Icon button in nav, top-right.

---

## 5. Hero Section

**Full viewport height.** Three.js globe rendered via React Three Fiber into a canvas with `alpha: true`. Canvas sits behind a CSS radial vignette overlay that blends it into the page background — making the globe feel embedded rather than dropped in.

### Globe parameters
- Radius: `2.8`
- Nodes: `300` distributed via Fibonacci sphere algorithm
- 3 tiers: major (14 nodes, large + bright), minor (70 nodes, medium), micro (rest, small/dim)
- Arcs: quadratic bezier, bowing `0.35×distanceBetweenNodes` outward from sphere surface. Drawn as `TubeGeometry` segments.
- Particles: two layers of traveling points along arc paths — white layer (45 particles, 1.0 opacity) and orange/accent2 layer (45 particles, 0.8 opacity)
- Atmosphere: transparent shell just outside R, `AdditiveBlending`
- Pulsing rings: 3 rings at equator/poles with sine-wave opacity
- Core glow: point light at origin

**Interaction:** Drag to spin. `pointerdown/pointermove/pointerup` on canvas. Angular velocity stored; decelerates at `0.92` multiplier per frame. Auto-rotation at `velY = 0.004` when no drag.

**Text overlay (inside globe, centered):**
- Name: `Mikhael Opeyemi-Olatunji` — small, weight 500, muted
- Headline: Two lines, large bold, with gradient span on the key phrase
- Subhead: role description, muted
- CTA button: `View my work ↓`

**Vignette overlay:** Absolute-positioned `div` over canvas. `radial-gradient(ellipse at center, transparent 38%, color-mix(in srgb, var(--bg) 95%, transparent))`. Pointer-events none.

---

## 6. About Section (`bg-alt`)

**Layout:** 2-column grid — wide left column + 380px right panel.

**Left:**
- Pull quote (weight 300, 28–32px): "I build software for the web — and I care deeply about how it *looks and feels.*" (em = accent color)
- 3 bio paragraphs
- Stats row (border-top): 4+ Years · 4 Companies · B.Sc. SFU 2024 (values in gradient fill)

**Right — Stack panel:**
- Bordered card (`var(--surface)`, `border-radius: 16px`)
- Header row: "Stack" label + "Technologies" label in accent
- 8 rows, each: technology name (left) + category tag (right). Tags: Core · Data · Infra · Testing · Creative · Observability
- No category grouping labels — just inline tags

---

## 7. Projects Section (`bg`)

**Layout:** Full-width typographic row list. No images.

4 projects as `<section>`-width rows, separated by `border-bottom`. Each row:
- Grid: `56px (number) | 1fr (content) | auto (right)`
- Left: row number `01`–`04` in `var(--text-dim)`, turns accent on hover
- Center: title (20px, weight 800) + description (13px, muted) + tech chips
- Right: impact label (hidden, slides in on hover) + circular arrow button (rotates 45° on hover)
- Left accent bar (3px wide, `var(--accent)`) scales in on hover via `transform: scaleY()`

Projects:
1. Splunk Monitoring Dashboards — React · TypeScript · SPL · Jsonnet · Cypress — "20% latency reduction"
2. Personal Finance Manager — React · Express · PostgreSQL · Tailwind — "Personal project"
3. DivTech Frontend — Next.js · TypeScript · TailwindCSS · AWS — "Contract"
4. This Portfolio — Next.js · R3F · Framer Motion · TypeScript — "mikhaelcodes.dev"

---

## 8. Experience Section (`bg-alt`)

Clean rows (`border-top` / `border-bottom`), hover gets `var(--chip-bg)` background.

Each row — 2-col grid: content left + date/location right.

- Company name: 20px, weight 800
- Role: pill badge — 12px, weight 600, `var(--accent)` text on `var(--accent-glow)` bg, `border-radius: 20px`
- Description: 14px, muted, `max-width: 560px`
- Tech chips: small bordered pills

4 companies: Splunk (Jan 2025–Present) · Fresh Prep (Sep 2023–Jan 2025) · DivTech (Feb 2024–Jun 2024) · BC Liquor (May 2022–Dec 2022)

---

## 9. Contact Section (`bg`)

Centered column. Full-width, `padding: 140px 48px`.

- Radial glow: `position: absolute`, `radial-gradient` using `var(--accent-glow)`
- Eyebrow: "Contact"
- Headline: `clamp(44px, 8vw, 96px)`, weight 800 — "Let's build something *together.*" (gradient on "together.")
- Subhead: "Open to new opportunities and collaborations."
- Email button: large bordered button, copies email to clipboard on click, hover turns accent
- Social links: LinkedIn · GitHub · Twitter · CodePen (small, muted)
- Copyright: `© 2025 Mikhael Opeyemi-Olatunji`

---

## 10. Animations

All scroll animations via Framer Motion `useInView` with `once: true`:
- Section eyebrow + title: fade up, 20px offset, `duration: 0.6`
- Content blocks: staggered fade up, `delay: 0.1` per item
- Project rows: slide in from left, staggered
- Stats: count-up animation on enter

Hero globe auto-starts rendering immediately (no scroll trigger).

Framer Motion `AnimatePresence` for theme toggle transition.

Lenis smooth scroll: `lerp: 0.1`, `duration: 1.2`.

---

## 11. File Structure

```
app/
  layout.tsx          — root layout: fonts, theme init script, Lenis provider
  page.tsx            — assembles all sections
  globals.css         — all CSS custom properties + base styles

components/
  nav/Nav.tsx         — sticky nav + theme toggle
  hero/
    Hero.tsx          — section wrapper + text overlay
    Globe.tsx         — R3F canvas + Three.js scene (dynamic, ssr:false)
  about/About.tsx
  projects/Projects.tsx
  experience/Experience.tsx
  contact/Contact.tsx
  ui/
    SectionHeader.tsx — eyebrow + title with gradient span
    Chip.tsx
    ThemeToggle.tsx

lib/
  theme.ts            — theme helpers + localStorage key
  lenis.tsx           — Lenis provider component

public/
  resume.pdf
```

---

## 12. Key Constraints

- R3F v8 requires React 18. Do NOT upgrade to R3F v9 or React 19.
- Globe component must be `dynamic(() => import(...), { ssr: false })` — Three.js requires browser environment.
- Theme init script must run before React hydration (blocking `<script>` in `<head>`) to avoid FOUC.
- `color-mix(in srgb, ...)` is used for the vignette — requires modern browser (Chromium 111+, Safari 16.2+). Acceptable given target audience.
- All CSS in `globals.css` — no Tailwind, no CSS Modules. CSS custom properties for all theming.
