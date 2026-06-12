// components/contact/Contact.tsx
'use client'
import { useState } from 'react'
import FadeUp from '@/components/ui/FadeUp'

const EMAIL = 'mikhaelolat@gmail.com'

export default function Contact() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — button text stays as email address
    }
  }

  return (
    <div className="contact-pin">
      <section className="contact" id="contact">
        <div className="contact-glow" />
        <FadeUp><p className="eyebrow" style={{ position: 'relative', zIndex: 1 }}>Contact</p></FadeUp>
        <FadeUp delay={0.05}>
          <h2 className="contact-title">
            Let&apos;s build<br />
            something <span className="gradient-text">together.</span>
          </h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="contact-sub">
            Open to new opportunities and collaborations.<br />
            I respond to every message.
          </p>
        </FadeUp>
        <FadeUp delay={0.15}>
          <button className="email-btn" onClick={handleCopy}>
            {copied ? 'Copied! ✓' : EMAIL}
          </button>
        </FadeUp>
        <FadeUp delay={0.2}>
          <nav className="contact-links">
            <a href="https://linkedin.com/in/mikhael-opeyemi" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://github.com/mikhaelolat" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://twitter.com/tha_mikky" target="_blank" rel="noopener noreferrer">Twitter</a>
          </nav>
        </FadeUp>
        <p className="copyright">© 2025 Mikhael Opeyemi-Olatunji</p>
      </section>
    </div>
  )
}
