// components/ui/SectionTitle.tsx
'use client'
import { motion } from 'framer-motion'

export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      className="section-title"
      initial={{ opacity: 0, letterSpacing: '0.02em', y: 24 }}
      whileInView={{ opacity: 1, letterSpacing: '-0.035em', y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.h2>
  )
}
