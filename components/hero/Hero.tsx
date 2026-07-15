// components/hero/Hero.tsx
import Magnetic from '@/components/ui/Magnetic'
import MouseParallax from '@/components/ui/MouseParallax'

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-vignette" />
      <MouseParallax>
        <div className="hero-content">
          <span className="hero-name">Mikhael Opeyemi-Olatunji</span>
          <h1 className="hero-headline">
            Building the web,{' '}
            <span className="gradient-text">one layer at a time.</span>
          </h1>
          <p className="hero-sub">
            Software engineer · Vancouver, BC<br />
            Currently at Splunk, a Cisco company
          </p>
          <Magnetic>
            <a href="#work" className="hero-cta">View my work ↓</a>
          </Magnetic>
        </div>
      </MouseParallax>
      <span className="hero-scroll-hint">scroll ↓</span>
    </section>
  )
}
