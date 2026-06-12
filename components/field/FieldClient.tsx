// components/field/FieldClient.tsx
'use client'
import dynamic from 'next/dynamic'

const ParticleField = dynamic(() => import('./ParticleField'), {
  ssr: false,
  loading: () => <div className="field-fallback" />,
})

export default function FieldClient() {
  return <ParticleField />
}
