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
