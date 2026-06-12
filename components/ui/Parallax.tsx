// components/ui/Parallax.tsx
'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

export default function Parallax({ children, distance = 40, className }: {
  children: React.ReactNode
  distance?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])
  return (
    <motion.div ref={ref} className={className} style={reduced ? undefined : { y }}>
      {children}
    </motion.div>
  )
}
