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

  it('handles n=1 without NaN', () => {
    for (const build of SHAPE_BUILDERS) {
      const a = build(1)
      for (let i = 0; i < a.length; i++) {
        expect(Number.isFinite(a[i])).toBe(true)
      }
    }
  })
})
