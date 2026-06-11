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
