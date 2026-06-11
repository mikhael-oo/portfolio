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
