# Immersive Overhaul — Design Spec

**Date:** 2026-06-10
**Status:** Approved pending final review

## Goal

Transform the portfolio from a clean single-page site with a 3D globe hero into an immersive scroll experience: a single persistent particle field that morphs through a distinct shape per section (concept B), combined with real depth treatment of the content — 3D tilt cards, parallax, layered typography (concept C). Mobile is a first-class target.

## Decisions made

| Decision | Choice |
|---|---|
| Ambition | Immersive overhaul |
| Direction | B (morphing particle field) + C (depth & layers) |
| Scroll feel | Hybrid: free scroll, with two short pinned beats |
| Mobile | First-class — tuned-down but real morphing experience |
| Implementation | Single persistent canvas, GPU shader morphing (Approach A) |

## The scroll journey

One continuous particle field behind all content, morphing through six states:

1. **Hero — Sphere** (free scroll). The globe, upgraded: denser particles, subtle shader shimmer, drag-to-spin retained. Name/headline float in front with slight mouse parallax. On load, particles assemble into the sphere from scattered positions (~1.2s intro riding the real page load — no fake loading screen).
2. **The Dissolve** (pinned beat #1). A 200vh section with a sticky 100vh inner. As the user scrolls, the sphere loses cohesion — particles stream outward/downward — while the About pull-quote fades up through the debris. The single biggest cinematic moment.
3. **About — Ambient drift** (free scroll). Sparse, slow-drifting particles; content leads. Stats count up on entering view. Stack panel gets 3D tilt-on-hover.
4. **Projects — Lattice** (free scroll). Particles snap into an ordered perspective grid "floor" receding into depth. Project rows become 3D tilt cards (pointer-tracked, spring physics, lifting on hover, accent edge glow). Lattice ripples subtly when a card is hovered.
5. **Experience — Wave** (free scroll). Lattice loosens into a slow horizontal wave flowing left-to-right (time passing). Role rows sit on the wave's rhythm; a thin thread connects dates like a floating timeline.
6. **Contact — Vortex** (pinned beat #2, short — 150vh wrapper). All particles converge into a slow spiral behind the contact title; the email button sits at the vortex eye.

## Architecture

### Particle field engine (new; replaces `components/hero/Globe*.tsx`)

- **`components/field/FieldClient.tsx`** — `ssr: false` dynamic wrapper (same pattern as the current `GlobeClient`).
- **`components/field/ParticleField.tsx`** — single R3F `<Canvas>`, `position: fixed; inset: 0`, behind all content, mounted once from `app/page.tsx`. Never unmounts; sections scroll over it. Drag-to-spin rotates the field group only while in sphere state, fading out as the dissolve begins.
- **`components/field/shapes.ts`** — pure, seeded/deterministic generators, one per shape: `sphere(n)`, `dissolve(n)`, `drift(n)`, `lattice(n)`, `wave(n)`, `vortex(n)`. Each returns a `Float32Array` (n×3) of target positions, generated once at mount. Independently testable.
- **`components/field/FieldMaterial.ts`** — one custom `ShaderMaterial`, single draw call for all particles. Attributes `aPosFrom`/`aPosTo` blended by `uProgress` uniform; per-shape procedural motion (wave bob, vortex spin, drift wobble) driven by `uTime` in the vertex shader so animation costs no per-frame JS. Per-particle `aScatter` seed varies easing so morphs feel organic.
- **`components/field/useFieldChoreography.ts`** — the brain. On mount/resize, measures each section's `offsetTop`/`height` to build a segment table (hero → dissolve → about → projects → experience → contact). On every Lenis scroll event, computes the active shape pair and local progress, writes uniforms and swaps attribute buffers imperatively — zero React re-renders during scroll.

### Pinned beats

Plain `position: sticky` — no scroll-jacking. Dissolve: 200vh wrapper, sticky 100vh inner containing About's pull-quote. Contact: 150vh equivalent. Works on mobile; compatible with Lenis.

### Depth layer (DOM + Framer Motion)

- **`components/ui/TiltCard.tsx`** — pointer-tracking 3D tilt with spring physics (project rows, stack panel).
- **`components/ui/Parallax.tsx`** — scroll-linked `y` offset via `useScroll` + `useTransform` (section titles, pull-quotes, at varying depths).
- **`components/ui/Magnetic.tsx`** — magnetic hover for CTA and email buttons.
- **`components/ui/CountUp.tsx`** — animated stat counters in About.
- Existing **`FadeUp`** stays for basic reveals.

### Theming

Same `data-theme` MutationObserver pattern as the current globe, but updates color/opacity/blending uniforms instead of rebuilding the scene — instant theme switches, no flash. Both light and dark themes remain fully supported.

### Removals

`components/hero/Globe.tsx` and `GlobeClient.tsx` are deleted. `Hero.tsx` keeps its text content, loses the canvas wrapper.

## Performance & fallbacks

- **Particle budget:** ~15,000 desktop / ~4,500 mobile (selected by viewport width + `navigator.hardwareConcurrency`); DPR capped at 1.5. All motion in the vertex shader; per-frame JS is uniform writes only. Target: 60fps on mid-range phones.
- **Mobile:** full morph journey with reduced particle count and slightly shorter pin distances. Tilt cards degrade to simple lift on touch devices (no pointer tracking).
- **`prefers-reduced-motion`:** static drift field, no morphing, pins become normal sections, reveals become simple fades. Site remains complete, just calm.
- **WebGL unavailable / context loss:** CSS radial-gradient backdrop replaces the field; everything else untouched. This is also the SSR/pre-hydration state, so no flash of empty background.

## Additional improvements (in scope)

1. **Nav:** active-section indicator tracking scroll; pill hides on scroll-down, reveals on scroll-up.
2. **Load intro:** particle assembly into sphere + staggered name/headline entrance.
3. **Typography rhythm:** keep Plus Jakarta Sans; larger display sizes on section titles, scroll-linked letter-spacing on entry, `text-wrap: balance` on headlines.
4. **OG image:** add a static Open Graph image (hero screenshot) — `metadataBase` and Twitter card exist but no image today.
5. **Section transitions:** scroll-animated background shifts between `--bg` and `--bg-alt` so boundaries feel continuous, not striped.

## Out of scope (YAGNI)

Custom cursor, sound, WebGL previews inside project cards, route transitions, new fonts, content/copy changes, new sections.

## Testing & verification

- Sanity checks for `shapes.ts` generators: correct array lengths, points within expected bounds, deterministic output.
- `next build` passes.
- Preview walkthrough: full scroll journey end-to-end, console clean, both themes, mobile viewport (preview resize), reduced-motion mode.
- User checkpoints at three milestones: (1) hero + persistent field, (2) full morph journey, (3) depth layer + polish.

## Build order (high level)

1. Field engine: shapes, material, persistent canvas, choreography hook — hero sphere working first.
2. Morph journey: segment table, dissolve pin, per-section shapes, contact pin.
3. Depth layer: TiltCard, Parallax, Magnetic, CountUp wired into sections.
4. Polish: nav upgrades, load intro, typography rhythm, section transitions, OG image.
5. Fallbacks & QA: reduced motion, WebGL fallback, mobile tuning, full verification.
