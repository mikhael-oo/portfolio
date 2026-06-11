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
