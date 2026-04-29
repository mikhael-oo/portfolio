// components/hero/Globe.tsx
'use client'
import { useRef, useEffect, useCallback, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const DARK = {
  node:  0xffffff,
  arc:   0xffffff,
  trav0: 0xffffff,
  trav1: 0xD5813A,
  ring:  0xffffff,
  atmo:  0xffffff,
  blend: THREE.AdditiveBlending,
  nodeOpacity: [0.9, 0.75, 0.5] as [number, number, number],
  arcOpacity: 0.18,
  trav0Opacity: 1.0,
  trav1Opacity: 0.85,
  atmoOpacity: 0.025,
}
const LIGHT = {
  node:  0x2C2724,
  arc:   0x2C2724,
  trav0: 0xB9314F,
  trav1: 0xC8601A,
  ring:  0x2C2724,
  atmo:  0x2C2724,
  blend: THREE.NormalBlending,
  nodeOpacity: [0.55, 0.4, 0.25] as [number, number, number],
  arcOpacity: 0.12,
  trav0Opacity: 0.7,
  trav1Opacity: 0.75,
  atmoOpacity: 0.0,
}

const R = 2.8
const N = 300
const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const NUM_TRAVELERS = 45

interface GlobeNode { pos: THREE.Vector3; tier: 'major' | 'minor' | 'micro' }
interface GlobeArc  { a: number; b: number; points: THREE.Vector3[] }
interface Traveler  { arcIdx: number; t: number; speed: number; layer: 0 | 1 }

function buildNodes(): GlobeNode[] {
  const nodes: GlobeNode[] = []
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = GOLDEN * i
    nodes.push({
      pos: new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r)
        .multiplyScalar(R),
      tier: i < 14 ? 'major' : i < 84 ? 'minor' : 'micro',
    })
  }
  return nodes
}

function buildArcs(nodes: GlobeNode[]): GlobeArc[] {
  const arcs: GlobeArc[] = []
  const BOW = 0.35
  const THRESH = 1.6
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i]
    const maxConn = a.tier === 'major' ? 5 : a.tier === 'minor' ? 3 : 2
    let count = 0
    for (let j = i + 1; j < nodes.length && count < maxConn; j++) {
      if (a.pos.distanceTo(nodes[j].pos) >= THRESH) continue
      const b = nodes[j]
      const dist = a.pos.distanceTo(b.pos)
      const mid = a.pos.clone().add(b.pos).multiplyScalar(0.5)
        .normalize().multiplyScalar(R + dist * BOW)
      const pts: THREE.Vector3[] = []
      for (let k = 0; k <= 24; k++) {
        const t = k / 24, u = 1 - t
        pts.push(
          a.pos.clone().multiplyScalar(u * u)
            .add(mid.clone().multiplyScalar(2 * u * t))
            .add(b.pos.clone().multiplyScalar(t * t))
        )
      }
      arcs.push({ a: i, b: j, points: pts })
      count++
    }
  }
  return arcs
}

function GlobeScene({ isDark }: { isDark: boolean }) {
  const { gl } = useThree()
  const groupRef   = useRef<THREE.Group>(null)
  const velX       = useRef(0)
  const velY       = useRef(0.004)
  const dragging   = useRef(false)
  const lastMouse  = useRef({ x: 0, y: 0 })
  const travelers  = useRef<Traveler[]>([])
  const travMesh   = useRef<[THREE.Points, THREE.Points] | null>(null)
  const pulseRings = useRef<THREE.Mesh[]>([])
  const timeRef    = useRef(0)
  const arcsRef    = useRef<GlobeArc[]>([])
  const nodeMats   = useRef<THREE.PointsMaterial[]>([])
  const arcMats    = useRef<THREE.LineBasicMaterial[]>([])
  const atmoMat    = useRef<THREE.MeshBasicMaterial | null>(null)

  const initScene = useCallback((group: THREE.Group) => {
    const nodes = buildNodes()
    const arcs  = buildArcs(nodes)
    arcsRef.current = arcs

    // Node point clouds
    const majPos: number[] = [], minPos: number[] = [], micPos: number[] = []
    nodes.forEach(n => {
      const arr = n.tier === 'major' ? majPos : n.tier === 'minor' ? minPos : micPos
      arr.push(n.pos.x, n.pos.y, n.pos.z)
    })
    const palette = isDark ? DARK : LIGHT
    const mkPoints = (pos: number[], size: number, opacity: number) => {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
      const mat = new THREE.PointsMaterial({
        size, opacity, transparent: true, color: palette.node,
        sizeAttenuation: true, depthWrite: false, blending: palette.blend,
      })
      nodeMats.current.push(mat)
      return new THREE.Points(geo, mat)
    }
    group.add(mkPoints(majPos, 0.08, palette.nodeOpacity[0]))
    group.add(mkPoints(minPos, 0.055, palette.nodeOpacity[1]))
    group.add(mkPoints(micPos, 0.035, palette.nodeOpacity[2]))

    // Arcs
    arcs.forEach(arc => {
      const geo = new THREE.BufferGeometry().setFromPoints(arc.points)
      const mat = new THREE.LineBasicMaterial({
        color: palette.arc, opacity: palette.arcOpacity, transparent: true,
        depthWrite: false, blending: palette.blend,
      })
      arcMats.current.push(mat)
      group.add(new THREE.Line(geo, mat))
    })

    // Travelers
    const tvList: Traveler[] = []
    const p0: number[] = [], p1: number[] = []
    for (let i = 0; i < NUM_TRAVELERS * 2; i++) {
      const layer = (i < NUM_TRAVELERS ? 0 : 1) as 0 | 1
      const arcIdx = Math.floor(Math.random() * arcs.length)
      const t = Math.random()
      tvList.push({ arcIdx, t, speed: 0.003 + Math.random() * 0.004, layer })
      const pt = arcs[arcIdx].points[Math.floor(t * (arcs[arcIdx].points.length - 1))]
      ;(layer === 0 ? p0 : p1).push(pt.x, pt.y, pt.z)
    }
    travelers.current = tvList
    const mkTrav = (pos: number[], color: number, size: number, opacity: number) => {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
      return new THREE.Points(geo, new THREE.PointsMaterial({
        size, color, opacity, transparent: true,
        sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
      }))
    }
    const t0 = mkTrav(p0, palette.trav0, 0.06, palette.trav0Opacity)
    const t1 = mkTrav(p1, palette.trav1, 0.07, palette.trav1Opacity)
    group.add(t0, t1)
    travMesh.current = [t0, t1]

    // Pulsing rings
    const rings = [0, Math.PI / 2, Math.PI / 4].map(angle => {
      const m = new THREE.Mesh(
        new THREE.RingGeometry(R - 0.02, R + 0.02, 96),
        new THREE.MeshBasicMaterial({
          color: palette.ring, opacity: 0.12, transparent: true,
          side: THREE.DoubleSide, depthWrite: false, blending: palette.blend,
        })
      )
      m.rotation.x = angle
      group.add(m)
      return m
    })
    pulseRings.current = rings

    // Atmosphere shell
    const am = new THREE.MeshBasicMaterial({
      color: palette.atmo, opacity: palette.atmoOpacity, transparent: true,
      side: THREE.BackSide, depthWrite: false, blending: palette.blend,
    })
    atmoMat.current = am
    group.add(new THREE.Mesh(new THREE.SphereGeometry(R + 0.25, 64, 64), am))
  }, [isDark])

  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    nodeMats.current = []
    arcMats.current = []
    atmoMat.current = null
    while (group.children.length) group.remove(group.children[0])
    initScene(group)

    const canvas = gl.domElement
    const onDown = (e: PointerEvent) => {
      dragging.current = true
      lastMouse.current = { x: e.clientX, y: e.clientY }
      velX.current = 0; velY.current = 0
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      velY.current = (e.clientX - lastMouse.current.x) * 0.008
      velX.current = (e.clientY - lastMouse.current.y) * 0.008
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }
    const onUp = () => { dragging.current = false }

    canvas.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [gl, initScene])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    timeRef.current += delta

    if (!dragging.current) {
      velY.current *= 0.95; velX.current *= 0.95
      if (Math.abs(velY.current) < 0.001) velY.current = 0.004
    }
    group.rotation.y += velY.current
    group.rotation.x = Math.max(
      -Math.PI / 4,
      Math.min(Math.PI / 4, group.rotation.x + velX.current)
    )

    pulseRings.current.forEach((ring, i) => {
      ;(ring.material as THREE.MeshBasicMaterial).opacity =
        0.08 + 0.08 * Math.sin(timeRef.current * 1.2 + i * 1.4)
    })

    const arcs = arcsRef.current
    const tm = travMesh.current
    if (!arcs.length || !tm) return
    const [t0, t1] = tm
    const pos0 = t0.geometry.attributes.position
    const pos1 = t1.geometry.attributes.position
    let i0 = 0, i1 = 0
    travelers.current.forEach(tr => {
      tr.t = (tr.t + tr.speed * delta * 60) % 1
      const pts = arcs[tr.arcIdx].points
      const pt = pts[Math.floor(tr.t * (pts.length - 1))]
      if (tr.layer === 0) { pos0.setXYZ(i0++, pt.x, pt.y, pt.z) }
      else                { pos1.setXYZ(i1++, pt.x, pt.y, pt.z) }
    })
    pos0.needsUpdate = true
    pos1.needsUpdate = true
  })

  return (
    <group ref={groupRef}>
      <pointLight position={[0, 0, 0]} intensity={0.4} color={0xffffff} />
    </group>
  )
}

export default function Globe() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const update = () =>
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    update()
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.5]}
      style={{ position: 'absolute', inset: 0 }}
    >
      <GlobeScene isDark={isDark} />
    </Canvas>
  )
}
