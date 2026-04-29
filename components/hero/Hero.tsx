// components/hero/Hero.tsx
import dynamic from 'next/dynamic'

const Globe = dynamic(() => import('./Globe'), { ssr: false })

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-canvas-wrap">
        <Globe />
      </div>
      <div className="hero-vignette" />
      <div className="hero-content">
        <span className="hero-name">Mikhael Opeyemi-Olatunji</span>
        <h1 className="hero-headline">
          Building the web,{' '}
          <span className="gradient-text">one layer at a time.</span>
        </h1>
        <p className="hero-sub">
          Full-stack engineer · Vancouver, BC<br />
          Currently at Splunk
        </p>
        <a href="#work" className="hero-cta">View my work ↓</a>
      </div>
      <span className="hero-scroll-hint">scroll ↓</span>
    </section>
  )
}
