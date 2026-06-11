# Immersive Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the globe-hero portfolio with a single persistent GPU particle field that morphs through six shapes as you scroll, plus a depth layer (tilt cards, parallax, magnetic buttons) and two sticky pinned beats.

**Architecture:** One fixed full-viewport R3F `<Canvas>` mounted behind all content; a custom `ShaderMaterial` blends two position attribute sets (`position` → `aPosTo`) by a scroll-driven `uProgress` uniform with per-shape procedural motion from `uTime`. Pure modules (`shapes.ts`, `choreography.ts`) are unit-tested with vitest; pinned beats use `position: sticky` (no scroll-jacking); depth effects are DOM + Framer Motion.

**Tech Stack:** Next.js 16 (App Router), React 19, @react-three/fiber 9, three 0.165, framer-motion 12, lenis, vitest (new dev dep).

**Spec:** `docs/superpowers/specs/2026-06-10-immersive-overhaul-design.md`

> ⚠️ **AGENTS.md applies:** this repo's Next.js has breaking changes vs training data. Before writing any Next-specific code beyond what's in this plan, read `node_modules/next/dist/docs/`. Two conventions already verified against the bundled docs: static `app/opengraph-image.png` file convention, and `dynamic(..., { ssr: false })` inside a client component (existing `GlobeClient` pattern).

## File structure

```
components/field/
  shapes.ts               # pure, seeded shape generators (unit tested)
  choreography.ts         # pure scroll→segment math (unit tested)
  FieldMaterial.ts        # ShaderMaterial factory + theme uniforms
  ParticleField.tsx       # the single persistent Canvas + scene + wiring
  FieldClient.tsx         # ssr:false dynamic wrapper
  __tests__/shapes.test.ts
  __tests__/choreography.test.ts
components/dissolve/Dissolve.tsx   # pinned beat #1 (200vh sticky)
components/ui/TiltCard.tsx
components/ui/Magnetic.tsx
components/ui/CountUp.tsx
components/ui/Parallax.tsx
components/ui/SectionTitle.tsx
components/ui/MouseParallax.tsx
app/opengraph-image.png + app/opengraph-image.alt.txt
Modified: app/page.tsx, app/layout.tsx, app/globals.css, components/hero/Hero.tsx,
          components/about/About.tsx, components/projects/Projects.tsx,
          components/experience/Experience.tsx, components/contact/Contact.tsx,
          components/nav/Nav.tsx, package.json
Deleted:  components/hero/Globe.tsx, components/hero/GlobeClient.tsx
```

Shape index order everywhere: `0 sphere (hero) · 1 dissolve · 2 drift (about) · 3 lattice (work) · 4 wave (experience) · 5 vortex (contact)`.

---

### Task 1: Test infrastructure (vitest)

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Add test script**

In `package.json` `"scripts"`, add:

```json
"test": "vitest run"
```

- [ ] **Step 3: Verify runner works (expect "no test files found" failure — that's the correct state)**

Run: `npm test`
Expected: exits non-zero with "No test files found" — confirms vitest runs.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add vitest"
```

---

### Task 2: Shape generators (TDD)

**Files:**
- Create: `components/field/shapes.ts`
- Test: `components/field/__tests__/shapes.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// components/field/__tests__/shapes.test.ts
import { describe, it, expect } from 'vitest'
import { SHAPE_BUILDERS, sphere } from '../shapes'

const N = 500

describe('shape generators', () => {
  it('every builder returns n*3 floats', () => {
    for (const build of SHAPE_BUILDERS) {
      expect(build(N).length).toBe(N * 3)
    }
  })

  it('every builder is deterministic', () => {
    for (const build of SHAPE_BUILDERS) {
      expect(Array.from(build(N))).toEqual(Array.from(build(N)))
    }
  })

  it('all points are finite and within scene bounds', () => {
    for (const build of SHAPE_BUILDERS) {
      const a = build(N)
      for (let i = 0; i < a.length; i++) {
        expect(Number.isFinite(a[i])).toBe(true)
        expect(Math.abs(a[i])).toBeLessThanOrEqual(24)
      }
    }
  })

  it('sphere points sit on radius 2.8', () => {
    const a = sphere(N)
    for (let i = 0; i < N; i++) {
      const r = Math.hypot(a[i * 3], a[i * 3 + 1], a[i * 3 + 2])
      expect(r).toBeGreaterThan(2.7)
      expect(r).toBeLessThan(2.9)
    }
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `../shapes`.

- [ ] **Step 3: Implement shapes.ts**

```ts
// components/field/shapes.ts
// Pure, seeded target-position generators for the particle field.
// Index order matches section order: sphere, dissolve, drift, lattice, wave, vortex.

export const R = 2.8
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function sphere(n: number): Float32Array {
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = GOLDEN * i
    out[i * 3] = Math.cos(theta) * r * R
    out[i * 3 + 1] = y * R
    out[i * 3 + 2] = Math.sin(theta) * r * R
  }
  return out
}

export function dissolve(n: number): Float32Array {
  // The sphere blown apart: each particle pushed along its radial direction, sinking.
  const base = sphere(n)
  const rand = mulberry32(101)
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2]
    const len = Math.hypot(x, y, z) || 1
    const push = 1 + rand() * 2.2
    out[i * 3] = (x / len) * R * push
    out[i * 3 + 1] = (y / len) * R * push - rand() * 3.5
    out[i * 3 + 2] = (z / len) * R * push * 0.6
  }
  return out
}

export function drift(n: number): Float32Array {
  const rand = mulberry32(202)
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    out[i * 3] = (rand() - 0.5) * 18
    out[i * 3 + 1] = (rand() - 0.5) * 10
    out[i * 3 + 2] = -1 - rand() * 4
  }
  return out
}

export function lattice(n: number): Float32Array {
  const rand = mulberry32(303)
  const out = new Float32Array(n * 3)
  const cols = Math.ceil(Math.sqrt(n * 2))
  const rows = Math.max(2, Math.ceil(n / cols))
  for (let i = 0; i < n; i++) {
    const c = i % cols
    const r = Math.floor(i / cols)
    out[i * 3] = (c / (cols - 1) - 0.5) * 20 + (rand() - 0.5) * 0.1
    out[i * 3 + 1] = -3.2 + (rand() - 0.5) * 0.08
    out[i * 3 + 2] = 2 - (r / (rows - 1)) * 14
  }
  return out
}

export function wave(n: number): Float32Array {
  const rand = mulberry32(404)
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const x = (rand() - 0.5) * 20
    const z = (rand() - 0.5) * 8 - 1
    out[i * 3] = x
    out[i * 3 + 1] = Math.sin(x * 0.6 + z * 0.5) * 0.9 - 1.5 // live bob added in shader
    out[i * 3 + 2] = z
  }
  return out
}

export function vortex(n: number): Float32Array {
  const rand = mulberry32(505)
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const t = i / n
    const r = Math.sqrt(t) * 5.2
    const a = i * GOLDEN + r * 1.8
    out[i * 3] = Math.cos(a) * r
    out[i * 3 + 1] = Math.sin(a) * r * 0.85
    out[i * 3 + 2] = -t * 2 + (rand() - 0.5) * 0.4
  }
  return out
}

export const SHAPE_BUILDERS = [sphere, dissolve, drift, lattice, wave, vortex] as const
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: 4 passing.

- [ ] **Step 5: Commit**

```bash
git add components/field/shapes.ts components/field/__tests__/shapes.test.ts
git commit -m "feat: seeded particle shape generators"
```

---

### Task 3: Scroll choreography math (TDD)

**Files:**
- Create: `components/field/choreography.ts`
- Test: `components/field/__tests__/choreography.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// components/field/__tests__/choreography.test.ts
import { describe, it, expect } from 'vitest'
import { buildAnchors, sampleTimeline } from '../choreography'

describe('buildAnchors', () => {
  it('anchors each section center to viewport center', () => {
    // section at top 0 height 800, viewport 800 → centered when scrollY = 0
    // section at top 800 height 1600 → centered when scrollY = 800 + 800 - 400 = 1200
    expect(buildAnchors([0, 800], [800, 1600], 800)).toEqual([0, 1200])
  })
})

describe('sampleTimeline', () => {
  const anchors = [0, 1000, 2000, 3000]

  it('clamps before the first anchor', () => {
    expect(sampleTimeline(anchors, -50)).toEqual({ from: 0, to: 1, t: 0 })
  })

  it('clamps after the last anchor', () => {
    expect(sampleTimeline(anchors, 9999)).toEqual({ from: 2, to: 3, t: 1 })
  })

  it('interpolates inside a segment', () => {
    expect(sampleTimeline(anchors, 1500)).toEqual({ from: 1, to: 2, t: 0.5 })
  })

  it('picks the correct later segment', () => {
    expect(sampleTimeline(anchors, 2250)).toEqual({ from: 2, to: 3, t: 0.25 })
  })

  it('survives a degenerate zero-width segment', () => {
    expect(sampleTimeline([0, 1000, 1000, 2000], 1000).t).toBeLessThanOrEqual(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `../choreography`.

- [ ] **Step 3: Implement choreography.ts**

```ts
// components/field/choreography.ts
// Pure scroll→shape-segment math. Anchor i corresponds to shape index i.

export interface TimelineSample {
  from: number
  to: number
  t: number
}

/** ScrollY at which each section's middle aligns with the viewport's middle. */
export function buildAnchors(tops: number[], heights: number[], viewportH: number): number[] {
  return tops.map((top, i) => top + heights[i] / 2 - viewportH / 2)
}

export function sampleTimeline(anchors: number[], scrollY: number): TimelineSample {
  const last = anchors.length - 1
  if (last < 1) return { from: 0, to: 0, t: 0 }
  if (scrollY <= anchors[0]) return { from: 0, to: 1, t: 0 }
  if (scrollY >= anchors[last]) return { from: last - 1, to: last, t: 1 }
  let i = 0
  while (scrollY > anchors[i + 1]) i++
  const span = anchors[i + 1] - anchors[i]
  const t = span <= 0 ? 1 : (scrollY - anchors[i]) / span
  return { from: i, to: i + 1, t: Math.min(1, Math.max(0, t)) }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all passing (shapes + choreography).

- [ ] **Step 5: Commit**

```bash
git add components/field/choreography.ts components/field/__tests__/choreography.test.ts
git commit -m "feat: scroll choreography segment math"
```

---

### Task 4: Field shader material

**Files:**
- Create: `components/field/FieldMaterial.ts`

No unit test (GPU code) — verified by typecheck in this task and visually in Task 5.

- [ ] **Step 1: Implement FieldMaterial.ts**

```ts
// components/field/FieldMaterial.ts
import * as THREE from 'three'

export const FIELD_THEMES = {
  dark: {
    color: 0xffffff, accent: 0xc94060, accent2: 0xd5813a,
    opacity: 0.85, blending: THREE.AdditiveBlending,
  },
  light: {
    color: 0x2c2724, accent: 0xb9314f, accent2: 0xc8601a,
    opacity: 0.6, blending: THREE.NormalBlending,
  },
} as const

const vertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uPulse; // 0..1, decays after a project card hover
  uniform int uShapeFrom;
  uniform int uShapeTo;
  uniform float uSize;
  attribute vec3 aPosTo;
  attribute float aScatter; // 0..1 per-particle random seed
  attribute float aTier;    // 0..1 size/color tier
  varying float vTier;

  // Per-shape procedural idle motion, computed on GPU so JS never touches positions.
  vec3 shapeMotion(int id, vec3 p, float t, float seed) {
    if (id == 0) {        // sphere: gentle radial shimmer
      return p * (1.0 + 0.015 * sin(t * 1.4 + seed * 6.2831));
    } else if (id == 1) { // dissolve: slow sinking drift
      return p + vec3(0.0, -0.25 * sin(t * 0.6 + seed * 6.2831), 0.0);
    } else if (id == 2) { // drift: lazy 3-axis wobble
      return p + 0.35 * vec3(sin(t * 0.5 + seed * 9.0), cos(t * 0.4 + seed * 7.0), sin(t * 0.3 + seed * 5.0));
    } else if (id == 3) { // lattice: faint pulse, amplified by uPulse on card hover (ripple)
      return p + vec3(0.0, (0.06 + 0.22 * uPulse) * sin(t * 1.2 + p.x * 0.8 + p.z * 0.8), 0.0);
    } else if (id == 4) { // wave: rolling bob travelling left to right
      return p + vec3(0.0, 0.55 * sin(t * 1.1 - p.x * 0.55 + p.z * 0.4), 0.0);
    } else {              // vortex: rotate in xy, faster near the eye
      float r = length(p.xy);
      float ang = (1.6 - r * 0.18) * t * 0.35;
      float c = cos(ang), s = sin(ang);
      return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z);
    }
  }

  void main() {
    // Scattered per-particle start times make morphs organic instead of mechanical.
    float p = smoothstep(0.0, 1.0, clamp((uProgress - aScatter * 0.25) / 0.75, 0.0, 1.0));
    vec3 from = shapeMotion(uShapeFrom, position, uTime, aScatter);
    vec3 to   = shapeMotion(uShapeTo,   aPosTo,   uTime, aScatter);
    vec4 mv = modelViewMatrix * vec4(mix(from, to, p), 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.6 + aTier) * uPixelRatio * (30.0 / -mv.z);
    vTier = aTier;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform vec3 uAccent2;
  uniform float uOpacity;
  varying float vTier;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.15, d) * uOpacity;
    vec3 col = uColor;
    if (vTier > 0.93) col = uAccent;
    else if (vTier > 0.86) col = uAccent2;
    gl_FragColor = vec4(col, alpha);
  }
`

export function createFieldMaterial(isDark: boolean): THREE.ShaderMaterial {
  const t = isDark ? FIELD_THEMES.dark : FIELD_THEMES.light
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: t.blending,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uShapeFrom: { value: 1 }, // intro: dissolve → sphere
      uShapeTo: { value: 0 },
      uSize: { value: 0.9 },
      uPixelRatio: { value: 1 },
      uColor: { value: new THREE.Color(t.color) },
      uAccent: { value: new THREE.Color(t.accent) },
      uAccent2: { value: new THREE.Color(t.accent2) },
      uOpacity: { value: t.opacity },
    },
  })
}

export function applyFieldTheme(mat: THREE.ShaderMaterial, isDark: boolean): void {
  const t = isDark ? FIELD_THEMES.dark : FIELD_THEMES.light
  ;(mat.uniforms.uColor.value as THREE.Color).set(t.color)
  ;(mat.uniforms.uAccent.value as THREE.Color).set(t.accent)
  ;(mat.uniforms.uAccent2.value as THREE.Color).set(t.accent2)
  mat.uniforms.uOpacity.value = t.opacity
  mat.blending = t.blending
  mat.needsUpdate = true
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/field/FieldMaterial.ts
git commit -m "feat: particle field shader material with theme support"
```

---

### Task 5: ParticleField canvas + client wrapper + CSS

**Files:**
- Create: `components/field/ParticleField.tsx`
- Create: `components/field/FieldClient.tsx`
- Modify: `app/globals.css` (append field styles)

- [ ] **Step 1: Implement ParticleField.tsx**

```tsx
// components/field/ParticleField.tsx
'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SHAPE_BUILDERS } from './shapes'
import { buildAnchors, sampleTimeline } from './choreography'
import { createFieldMaterial, applyFieldTheme } from './FieldMaterial'

const SECTION_IDS = ['hero', 'dissolve', 'about', 'work', 'experience', 'contact']
const INTRO_SECONDS = 1.2

function pickCount(): number {
  const small = window.innerWidth < 768
  const weak = (navigator.hardwareConcurrency ?? 8) <= 4
  return small || weak ? 4500 : 15000
}

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function FieldScene({ isDark, reduced }: { isDark: boolean; reduced: boolean }) {
  const { gl } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const count = useMemo(pickCount, [])
  const shapes = useMemo(() => SHAPE_BUILDERS.map(b => b(count)), [count])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const material = useMemo(() => createFieldMaterial(isDark), []) // theme updates via applyFieldTheme

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const scatter = new Float32Array(count)
    const tier = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      scatter[i] = Math.random()
      tier[i] = Math.random()
    }
    // Reduced motion: static drift state, no intro, no morphing.
    const from = reduced ? shapes[2] : shapes[1] // dissolve→sphere intro otherwise
    const to = reduced ? shapes[2] : shapes[0]
    geo.setAttribute('position', new THREE.BufferAttribute(from.slice(), 3))
    geo.setAttribute('aPosTo', new THREE.BufferAttribute(to.slice(), 3))
    geo.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 1))
    geo.setAttribute('aTier', new THREE.BufferAttribute(tier, 1))
    return geo
  }, [count, shapes, reduced])

  const anchorsRef = useRef<number[]>([])
  const segmentRef = useRef({ from: 1, to: 0 }) // intro state
  const introStart = useRef<number | null>(null)
  const introDone = useRef(reduced)
  const velY = useRef(0.0)
  const dragging = useRef(false)
  const lastX = useRef(0)

  // Theme switches update uniforms in place — no scene rebuild.
  useEffect(() => {
    applyFieldTheme(material, isDark)
  }, [isDark, material])

  // Measure section anchors; re-measure when layout changes.
  useEffect(() => {
    const measure = () => {
      const tops: number[] = []
      const heights: number[] = []
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        tops.push(rect.top + window.scrollY)
        heights.push(rect.height)
      }
      anchorsRef.current = buildAnchors(tops, heights, window.innerHeight)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  // Drag-to-spin, attached to the hero section (canvas itself is pointer-events: none).
  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return
    const onDown = (e: PointerEvent) => {
      dragging.current = true
      lastX.current = e.clientX
      velY.current = 0
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      velY.current = (e.clientX - lastX.current) * 0.008
      lastX.current = e.clientX
    }
    const onUp = () => { dragging.current = false }
    hero.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      hero.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  // Lattice ripple: hovering a project row kicks uPulse, which decays each frame.
  const pulse = useRef(0)
  useEffect(() => {
    const onOver = (e: Event) => {
      if ((e.target as HTMLElement).closest?.('.proj-row')) pulse.current = 1
    }
    document.addEventListener('pointerover', onOver, true)
    return () => document.removeEventListener('pointerover', onOver, true)
  }, [])

  useFrame((state, delta) => {
    const u = material.uniforms
    u.uPixelRatio.value = gl.getPixelRatio()
    if (reduced) return // frozen field: no time, no morphing, no spin

    u.uTime.value += delta
    pulse.current = Math.max(0, pulse.current - delta * 0.8)
    u.uPulse.value = pulse.current

    // Intro: assemble dissolve→sphere on load.
    if (!introDone.current) {
      if (introStart.current === null) introStart.current = state.clock.elapsedTime
      const p = Math.min((state.clock.elapsedTime - introStart.current) / INTRO_SECONDS, 1)
      u.uProgress.value = p
      if (p >= 1) introDone.current = true
      return
    }

    // Scroll-driven morphing.
    const anchors = anchorsRef.current
    if (anchors.length >= 2) {
      const s = sampleTimeline(anchors, window.scrollY)
      const seg = segmentRef.current
      if (s.from !== seg.from || s.to !== seg.to) {
        ;(geometry.attributes.position.array as Float32Array).set(shapes[s.from])
        ;(geometry.attributes.aPosTo.array as Float32Array).set(shapes[s.to])
        geometry.attributes.position.needsUpdate = true
        geometry.attributes.aPosTo.needsUpdate = true
        u.uShapeFrom.value = s.from
        u.uShapeTo.value = s.to
        segmentRef.current = { from: s.from, to: s.to }
      }
      u.uProgress.value = s.t

      // Spin only while the sphere is on screen, fading out into the dissolve.
      const group = groupRef.current
      if (group) {
        const spinWeight = s.from === 0 ? Math.max(0, 1 - s.t * 2) : 0
        if (!dragging.current) {
          velY.current *= 0.95
          if (Math.abs(velY.current) < 0.001) velY.current = 0.004
        }
        group.rotation.y += velY.current * spinWeight
      }
    }
  })

  return (
    <group ref={groupRef}>
      <points geometry={geometry} material={material} />
    </group>
  )
}

export default function ParticleField() {
  const [isDark, setIsDark] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!webglAvailable()) {
      setFailed(true)
      return
    }
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    const update = () =>
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    update()
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    setReady(true)
    return () => obs.disconnect()
  }, [])

  if (failed || !ready) return <div className="field-fallback" />

  return (
    <div className="field-wrap" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ alpha: true, antialias: false }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', () => setFailed(true))
        }}
      >
        <FieldScene isDark={isDark} reduced={reduced} />
      </Canvas>
    </div>
  )
}
```

- [ ] **Step 2: Implement FieldClient.tsx**

```tsx
// components/field/FieldClient.tsx
'use client'
import dynamic from 'next/dynamic'

const ParticleField = dynamic(() => import('./ParticleField'), {
  ssr: false,
  loading: () => <div className="field-fallback" />,
})

export default function FieldClient() {
  return <ParticleField />
}
```

- [ ] **Step 3: Append field CSS to `app/globals.css`**

```css
/* ── Particle field ── */
.field-wrap {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
}
.field-fallback {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background: radial-gradient(ellipse 60% 50% at 50% 42%, var(--accent-glow), transparent 70%);
}
main { position: relative; z-index: 1; }
```

- [ ] **Step 4: Verify it typechecks and builds**

Run: `npx tsc --noEmit && npm run build`
Expected: success (component not yet mounted — that's Task 6).

- [ ] **Step 5: Commit**

```bash
git add components/field/ParticleField.tsx components/field/FieldClient.tsx app/globals.css
git commit -m "feat: persistent particle field canvas with intro, themes, fallbacks"
```

---

### Task 6: Mount the field, retire the globe

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx` (MotionConfig)
- Modify: `components/hero/Hero.tsx`
- Modify: `app/globals.css` (hero cursor, remove canvas-wrap styles)
- Delete: `components/hero/Globe.tsx`, `components/hero/GlobeClient.tsx`

- [ ] **Step 1: Update `app/page.tsx`**

```tsx
// app/page.tsx
import Nav from '@/components/nav/Nav'
import Hero from '@/components/hero/Hero'
import About from '@/components/about/About'
import Projects from '@/components/projects/Projects'
import Experience from '@/components/experience/Experience'
import Contact from '@/components/contact/Contact'
import FieldClient from '@/components/field/FieldClient'

export default function Home() {
  return (
    <main>
      <FieldClient />
      <Nav />
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Contact />
    </main>
  )
}
```

- [ ] **Step 2: Update `components/hero/Hero.tsx`** (drop the canvas wrapper; field renders behind everything now)

```tsx
// components/hero/Hero.tsx
export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-vignette" />
      <div className="hero-content">
        <span className="hero-name">Mikhael Opeyemi-Olatunji</span>
        <h1 className="hero-headline">
          Building the web,{' '}
          <span className="gradient-text">one layer at a time.</span>
        </h1>
        <p className="hero-sub">
          Full-stack engineer · Vancouver, BC<br />
          Currently at Splunk
        </p>
        <a href="#work" className="hero-cta">View my work ↓</a>
      </div>
      <span className="hero-scroll-hint">scroll ↓</span>
    </section>
  )
}
```

- [ ] **Step 3: Wrap children in MotionConfig in `app/layout.tsx`** (makes every Framer Motion animation respect prefers-reduced-motion)

Add import:

```tsx
import { MotionConfig } from 'framer-motion'
```

Replace the `<LenisProvider>` block body:

```tsx
<LenisProvider>
  <MotionConfig reducedMotion="user">
    {children}
  </MotionConfig>
</LenisProvider>
```

Note: `MotionConfig` is a client component imported into a server layout — if the build rejects this, create `components/ui/MotionProvider.tsx` with `'use client'` wrapping `MotionConfig` and use that instead.

- [ ] **Step 4: Update hero CSS in `app/globals.css`**

Remove these rules (the canvas no longer lives inside the hero):

```css
.hero-canvas-wrap { position: absolute; inset: 0; z-index: 0; }
.hero-canvas-wrap canvas { cursor: grab; }
.hero-canvas-wrap canvas:active { cursor: grabbing; }
```

Update `.hero` to be transparent and grabbable (drag-to-spin listens on the section):

```css
.hero {
  position: relative; height: 100vh; min-height: 640px;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; background: transparent; cursor: grab;
}
.hero:active { cursor: grabbing; }
```

- [ ] **Step 5: Delete the globe**

```bash
git rm components/hero/Globe.tsx components/hero/GlobeClient.tsx
```

- [ ] **Step 6: Build and verify in preview**

Run: `npm run build`
Expected: success.

Then start the dev preview, load the page, and confirm: particles assemble into a sphere behind the hero (~1.2s), drag spins it, theme toggle recolors it instantly, console clean. Scrolling already morphs sphere→…→vortex across existing sections (anchors skip the not-yet-existing `#dissolve`).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: mount particle field, retire globe hero"
```

---

### Task 7: Dissolve pinned beat

**Files:**
- Create: `components/dissolve/Dissolve.tsx`
- Modify: `app/page.tsx` (insert between Hero and About)
- Modify: `components/about/About.tsx` (remove pull-quote — it moves here)
- Modify: `app/globals.css` (dissolve styles + reduced-motion unpinning)

- [ ] **Step 1: Implement Dissolve.tsx**

```tsx
// components/dissolve/Dissolve.tsx
'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Dissolve() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0.3, 0.55, 0.85], [0, 1, 1])
  const y = useTransform(scrollYProgress, [0.3, 0.65], [48, 0])

  return (
    <section className="dissolve" id="dissolve" ref={ref}>
      <div className="dissolve-sticky">
        <motion.p className="dissolve-pull" style={{ opacity, y }}>
          I build software for the web — and I care deeply about how it{' '}
          <em>looks and feels.</em>
        </motion.p>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Insert into `app/page.tsx`**

```tsx
import Dissolve from '@/components/dissolve/Dissolve'
```

and in the JSX, between `<Hero />` and `<About />`:

```tsx
<Hero />
<Dissolve />
<About />
```

- [ ] **Step 3: Remove the pull-quote from About.tsx**

Delete this block from `components/about/About.tsx` (it now lives in Dissolve):

```tsx
<p className="about-pull">
  I build software for the web — and I care deeply about how it{' '}
  <em>looks and feels.</em>
</p>
```

- [ ] **Step 4: Append dissolve CSS to `app/globals.css`**

```css
/* ── Dissolve (pinned beat #1) ── */
.dissolve { height: 200vh; position: relative; }
.dissolve-sticky {
  position: sticky; top: 0; height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 0 48px;
}
.dissolve-pull {
  font-size: clamp(26px, 3.6vw, 44px); font-weight: 300;
  color: var(--text); line-height: 1.35; letter-spacing: -0.02em;
  max-width: 760px; text-align: center; text-wrap: balance;
}
.dissolve-pull em { color: var(--accent); font-style: normal; font-weight: 400; }

@media (prefers-reduced-motion: reduce) {
  .dissolve { height: auto; }
  .dissolve-sticky { position: static; height: auto; padding: 112px 48px; }
}
@media (max-width: 900px) {
  .dissolve { height: 170vh; }
}
```

- [ ] **Step 5: Build and verify in preview**

Run: `npm run build` → success. In preview: scrolling out of the hero pins the viewport while the sphere breaks apart and the pull-quote fades up through it; releases into About.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: dissolve pinned beat between hero and about"
```

---

### Task 8: Contact pinned beat (vortex)

**Files:**
- Modify: `components/contact/Contact.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Wrap Contact in a pin wrapper**

In `components/contact/Contact.tsx`, change the outer JSX from:

```tsx
<section className="contact" id="contact">
  ...all existing children unchanged...
</section>
```

to:

```tsx
<div className="contact-pin">
  <section className="contact" id="contact">
    ...all existing children unchanged...
  </section>
</div>
```

- [ ] **Step 2: Update contact CSS in `app/globals.css`**

Replace the existing `.contact { ... }` rule with:

```css
.contact-pin { height: 150vh; position: relative; }
.contact {
  position: sticky; top: 0; height: 100vh;
  padding: 0 48px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
  overflow: hidden;
}
@media (prefers-reduced-motion: reduce) {
  .contact-pin { height: auto; }
  .contact { position: static; height: auto; padding: 140px 48px; }
}
```

And in the existing `@media (max-width: 900px)` block, replace `.contact { padding: 100px 24px; }` with `.contact { padding: 0 24px; }`.

- [ ] **Step 3: Build and verify in preview**

Run: `npm run build` → success. In preview: reaching Contact pins briefly while particles spiral into the vortex behind the title; email button sits at the eye; footer releases.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: contact pinned beat with vortex convergence"
```

---

### Task 9: Depth components (TiltCard, Magnetic, CountUp, Parallax, SectionTitle)

**Files:**
- Create: `components/ui/TiltCard.tsx`
- Create: `components/ui/Magnetic.tsx`
- Create: `components/ui/CountUp.tsx`
- Create: `components/ui/Parallax.tsx`
- Create: `components/ui/SectionTitle.tsx`

- [ ] **Step 1: Implement TiltCard.tsx**

```tsx
// components/ui/TiltCard.tsx
'use client'
import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface TiltCardProps {
  children: React.ReactNode
  max?: number // degrees
  className?: string
}

export default function TiltCard({ children, max = 6, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 180, damping: 20 })
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 180, damping: 20 })

  function onMove(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse' || !ref.current) return // touch: simple lift only
    const r = ref.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  function onLeave() {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', transformPerspective: 900 }}
      whileHover={{ y: -4 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Implement Magnetic.tsx**

```tsx
// components/ui/Magnetic.tsx
'use client'
import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function Magnetic({ children, strength = 0.3 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 200, damping: 18 })
  const y = useSpring(my, { stiffness: 200, damping: 18 })

  function onMove(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - (r.left + r.width / 2)) * strength)
    my.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  function onLeave() {
    mx.set(0)
    my.set(0)
  }

  return (
    <motion.div ref={ref} style={{ x, y, display: 'inline-block' }} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 3: Implement CountUp.tsx**

```tsx
// components/ui/CountUp.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

// Animates the leading integer of strings like "4+" or "4"; non-numeric values
// (e.g. "B.Sc.") render unchanged.
export default function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const match = value.match(/^(\d+)(.*)$/)
  const [display, setDisplay] = useState(match ? `0${match[2]}` : value)

  useEffect(() => {
    if (!inView || !match) return
    const target = parseInt(match[1], 10)
    const suffix = match[2]
    const t0 = performance.now()
    const dur = 1200
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(`${Math.round(eased * target)}${suffix}`)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  return <span ref={ref} className="stat-val">{display}</span>
}
```

- [ ] **Step 4: Implement Parallax.tsx**

```tsx
// components/ui/Parallax.tsx
'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Parallax({ children, distance = 40, className }: {
  children: React.ReactNode
  distance?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])
  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 5: Implement SectionTitle.tsx**

```tsx
// components/ui/SectionTitle.tsx
'use client'
import { motion } from 'framer-motion'

export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      className="section-title"
      initial={{ opacity: 0, letterSpacing: '0.02em', y: 24 }}
      whileInView={{ opacity: 1, letterSpacing: '-0.035em', y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.h2>
  )
}
```

- [ ] **Step 6: Implement MouseParallax.tsx** (hero text floats slightly against the cursor)

```tsx
// components/ui/MouseParallax.tsx
'use client'
import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function MouseParallax({ children, strength = 12 }: {
  children: React.ReactNode
  strength?: number
}) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 60, damping: 20 })
  const y = useSpring(my, { stiffness: 60, damping: 20 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      mx.set((e.clientX / window.innerWidth - 0.5) * -strength)
      my.set((e.clientY / window.innerHeight - 0.5) * -strength)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [mx, my, strength])

  return <motion.div style={{ x, y }}>{children}</motion.div>
}
```

- [ ] **Step 7: Typecheck and commit**

Run: `npx tsc --noEmit`
Expected: no errors.

```bash
git add components/ui/TiltCard.tsx components/ui/Magnetic.tsx components/ui/CountUp.tsx components/ui/Parallax.tsx components/ui/SectionTitle.tsx components/ui/MouseParallax.tsx
git commit -m "feat: depth-layer UI components"
```

---

### Task 10: Wire depth components into sections

**Files:**
- Modify: `components/about/About.tsx`
- Modify: `components/projects/Projects.tsx`
- Modify: `components/experience/Experience.tsx`
- Modify: `components/hero/Hero.tsx`
- Modify: `components/contact/Contact.tsx`

- [ ] **Step 1: About — SectionTitle, CountUp stats, TiltCard stack panel**

In `components/about/About.tsx`:

```tsx
import SectionTitle from '@/components/ui/SectionTitle'
import CountUp from '@/components/ui/CountUp'
import TiltCard from '@/components/ui/TiltCard'
import Parallax from '@/components/ui/Parallax'
```

Replace the `<h2 className="section-title">…</h2>` (keep it inside its FadeUp) with:

```tsx
<Parallax distance={24}>
  <SectionTitle>Who I <span className="gradient-text">am.</span></SectionTitle>
</Parallax>
```

Replace the stats block with:

```tsx
<div className="stats">
  <div><CountUp value="4+" /><span className="stat-lbl">Years exp.</span></div>
  <div><CountUp value="4" /><span className="stat-lbl">Companies</span></div>
  <div><CountUp value="B.Sc." /><span className="stat-lbl">SFU · 2024</span></div>
</div>
```

(`CountUp` renders the `stat-val` span itself.)

Wrap the stack panel:

```tsx
<TiltCard max={4}>
  <div className="stack-panel">
    ...existing panel children unchanged...
  </div>
</TiltCard>
```

- [ ] **Step 2: Projects — SectionTitle + TiltCard rows**

In `components/projects/Projects.tsx`, add imports:

```tsx
import SectionTitle from '@/components/ui/SectionTitle'
import TiltCard from '@/components/ui/TiltCard'
import Parallax from '@/components/ui/Parallax'
```

Replace the title h2 with:

```tsx
<Parallax distance={36}>
  <SectionTitle>Projects that <span className="gradient-text">matter.</span></SectionTitle>
</Parallax>
```

and wrap each row's `<a className="proj-row" …>` in `<TiltCard max={2}>…</TiltCard>` (inside the existing FadeUp).

- [ ] **Step 3: Experience — SectionTitle**

Same imports + replacement for the `section-title` h2 in `components/experience/Experience.tsx`, using `<Parallax distance={30}>` as the wrapper (keep all existing content/text exactly).

- [ ] **Step 4: Hero + Contact — Magnetic CTAs**

In `components/hero/Hero.tsx` (server component — Magnetic/MouseParallax are client islands, importing them is fine):

```tsx
import Magnetic from '@/components/ui/Magnetic'
import MouseParallax from '@/components/ui/MouseParallax'
```

Wrap the hero content block so name/headline float subtly against the cursor:

```tsx
<MouseParallax>
  <div className="hero-content">
    ...existing children, with the CTA wrapped:
    <Magnetic>
      <a href="#work" className="hero-cta">View my work ↓</a>
    </Magnetic>
  </div>
</MouseParallax>
```

In `components/contact/Contact.tsx`:

```tsx
import Magnetic from '@/components/ui/Magnetic'
```

Wrap the email button (inside its FadeUp):

```tsx
<Magnetic strength={0.2}>
  <button className="email-btn" onClick={handleCopy}>
    {copied ? 'Copied! ✓' : EMAIL}
  </button>
</Magnetic>
```

- [ ] **Step 5: Build and verify in preview**

Run: `npm run build` → success. In preview: stack panel and project rows tilt toward the cursor, CTA/email follow the pointer slightly, stats count up when About enters, titles ease their letter-spacing in.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: wire tilt, magnetic, count-up, and title reveals into sections"
```

---

### Task 11: Nav — active section indicator + hide on scroll down

**Files:**
- Modify: `components/nav/Nav.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add scroll/active state to Nav.tsx**

Inside the `Nav` component (after the theme state), add:

```tsx
const [active, setActive] = useState('')
const [hidden, setHidden] = useState(false)

useEffect(() => {
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
    { rootMargin: '-40% 0px -55% 0px' }
  )
  for (const id of ['about', 'work', 'experience', 'contact']) {
    const el = document.getElementById(id)
    if (el) obs.observe(el)
  }
  return () => obs.disconnect()
}, [])

useEffect(() => {
  let last = window.scrollY
  const onScroll = () => {
    const y = window.scrollY
    setHidden(y > last && y > 200)
    last = y
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}, [])
```

Change the wrapper div to:

```tsx
<div className={`nav-wrap${hidden ? ' nav-hidden' : ''}`}>
```

And on each of the four section links, add the active class + aria-current, e.g. for About:

```tsx
<a href="#about" aria-label="About"
   className={active === 'about' ? 'nav-active' : undefined}
   aria-current={active === 'about' ? 'true' : undefined}>
```

(repeat for `work`, `experience`, `contact` with their ids).

- [ ] **Step 2: Add nav CSS to `app/globals.css`**

```css
.nav-wrap { transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.nav-wrap.nav-hidden { transform: translateX(-50%) translateY(-180%); }
.nav-links a.nav-active { color: var(--text); }
.nav-links a.nav-active::after {
  content: ''; display: inline-block; width: 4px; height: 4px;
  border-radius: 50%; background: var(--accent); margin-left: 6px;
  vertical-align: 2px;
}
```

- [ ] **Step 3: Build and verify in preview**

Run: `npm run build` → success. In preview: scrolling down hides the pill, scrolling up reveals it; the section you're in shows an accent dot.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: nav active-section indicator and hide-on-scroll"
```

---

### Task 12: CSS polish — typography rhythm + continuous section transitions

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Typography rhythm**

Update `.section-title` (bigger display scale + balance):

```css
.section-title {
  font-size: clamp(40px, 5.5vw, 68px); font-weight: 800;
  letter-spacing: -0.035em; color: var(--text); line-height: 1.0;
  margin-bottom: 64px; text-wrap: balance;
}
```

Add balance to the hero headline rule (`.hero-headline`): append `text-wrap: balance;`.

- [ ] **Step 2: Continuous section backgrounds**

The fixed canvas must show through, so solid section backgrounds become soft gradients. Replace `.section-alt`'s background:

```css
.section-alt {
  padding: 112px 48px; position: relative;
  background: linear-gradient(
    180deg,
    transparent 0%,
    color-mix(in srgb, var(--bg-alt) 70%, transparent) 18%,
    color-mix(in srgb, var(--bg-alt) 70%, transparent) 82%,
    transparent 100%
  );
}
```

- [ ] **Step 3: Experience timeline thread**

Add to `app/globals.css` (a thin thread connecting each role's dates, echoing the wave-timeline idea):

```css
.exp-dates::before {
  content: ''; display: inline-block; width: 28px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent));
  margin-right: 10px; vertical-align: 4px; opacity: 0.7;
}
@media (max-width: 900px) {
  .exp-dates::before { display: none; }
}
```

- [ ] **Step 4: Build and verify in preview**

Run: `npm run build` → success. In preview: section boundaries blend instead of striping; titles feel bigger and balanced; particles are faintly visible behind alt sections; experience dates show their accent thread.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "feat: typography rhythm, section transitions, experience timeline thread"
```

---

### Task 13: OG image

**Files:**
- Create: `app/opengraph-image.png` (1200×630)
- Create: `app/opengraph-image.alt.txt`

- [ ] **Step 1: Capture the hero**

Start the dev preview, resize the viewport to 1200×630, wait for the intro to finish (~2s), and take a screenshot. Save/copy the captured PNG to `app/opengraph-image.png`. (Next 16 file convention verified in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md` — a static `opengraph-image.png` in `app/` is picked up automatically; keep it under 8MB.)

- [ ] **Step 2: Add alt text**

```txt
Mikhael Opeyemi-Olatunji — full-stack engineer. Particle-field portfolio hero.
```

Save as `app/opengraph-image.alt.txt`.

- [ ] **Step 3: Verify the meta tags**

Run: `npm run build` → success. Then in the preview, check the page head contains `og:image` (e.g. via the rendered HTML source).

- [ ] **Step 4: Commit**

```bash
git add app/opengraph-image.png app/opengraph-image.alt.txt
git commit -m "feat: open graph image"
```

---

### Task 14: Final QA walkthrough

**Files:** none (verification only; fix-ups as needed)

- [ ] **Step 1: Tests and build**

Run: `npm test && npx tsc --noEmit && npm run build`
Expected: all tests pass, no type errors, build succeeds.

- [ ] **Step 2: Full desktop walkthrough in preview**

Scroll the entire journey top to bottom. Verify, in order: intro assembly → sphere drag-spin → dissolve pin with pull-quote → calm drift behind About → lattice + tilting project rows → wave behind Experience → vortex pin at Contact. Console must be clean.

- [ ] **Step 3: Theme check**

Toggle dark/light at the top and again mid-page. Field recolors instantly; no flash; both themes readable in every section.

- [ ] **Step 4: Mobile viewport check**

Resize preview to 390×844. Verify: reduced particle count still morphs, pins release correctly, nav collapses to icons, tilt degrades to simple lift, layout intact in every section.

- [ ] **Step 5: Reduced motion check**

Emulate `prefers-reduced-motion: reduce` (re-load the page). Verify: static drift field, no pinning (dissolve/contact flow as normal sections), content reveals are simple fades, site fully readable.

- [ ] **Step 6: Fix anything found, then commit**

```bash
git add -A
git commit -m "fix: QA fixes from immersive overhaul walkthrough"
```

(Skip the commit if nothing needed fixing.)
