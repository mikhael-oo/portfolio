// components/field/ParticleField.tsx
'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SHAPE_BUILDERS, R } from './shapes'
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
  const { gl, camera, size } = useThree()
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

  // On narrow viewports the vertical fov leaves little horizontal room, so
  // pull the camera back until the hero sphere fits, never closer than 7.
  useEffect(() => {
    const aspect = size.width / size.height
    const halfFov = (45 * Math.PI) / 360
    camera.position.z = Math.max(7, (R * 0.85) / (Math.tan(halfFov) * aspect))
  }, [camera, size])

  // Reduced motion: geometry holds drift positions in both buffers, so the
  // shader must treat them as a single shape (no dissolve/sphere offsets).
  useEffect(() => {
    if (!reduced) return
    material.uniforms.uShapeFrom.value = 2
    material.uniforms.uShapeTo.value = 2
  }, [reduced, material])

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
      if (e.pointerType !== 'mouse') return
      dragging.current = true
      lastX.current = e.clientX
      velY.current = 0
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
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

    // Intro: assemble dissolve→sphere on load. Skipped when the page starts
    // mid-scroll (refresh/deep-link) — the scroll block below seeds the real
    // segment on this same first frame, before anything has rendered.
    if (!introDone.current) {
      if (introStart.current === null) {
        if (window.scrollY > window.innerHeight * 0.2) {
          introDone.current = true
        } else {
          introStart.current = state.clock.elapsedTime
        }
      }
      if (!introDone.current) {
        const p = Math.min((state.clock.elapsedTime - introStart.current!) / INTRO_SECONDS, 1)
        u.uProgress.value = p
        if (p >= 1) introDone.current = true
        return
      }
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
