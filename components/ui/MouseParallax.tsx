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
