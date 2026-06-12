// components/dissolve/Dissolve.tsx
'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Dissolve() {
  const ref = useRef<HTMLElement | null>(null)
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
