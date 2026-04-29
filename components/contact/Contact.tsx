// components/contact/Contact.tsx
'use client'
import { useState } from 'react'

const EMAIL = 'mikhaelolat@gmail.com'

export default function Contact() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(EMAIL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="contact" id="contact">
      <div className="contact-glow" />
      <p className="eyebrow" style={{ position: 'relative', zIndex: 1 }}>Contact</p>
      <h2 className="contact-title">
        Let&apos;s build<br />
        something <span className="gradient-text">together.</span>
      </h2>
      <p className="contact-sub">
        Open to new opportunities and collaborations.<br />
        I respond to every message.
      </p>
      <button className="email-btn" onClick={handleCopy}>
        {copied ? 'Copied! ✓' : EMAIL}
      </button>
      <nav className="contact-links">
        <a href="https://linkedin.com/in/mikhael-opeyemi" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="https://github.com/mikhaelolat" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://twitter.com/tha_mikky" target="_blank" rel="noopener noreferrer">Twitter</a>
      </nav>
      <p className="copyright">© 2025 Mikhael Opeyemi-Olatunji</p>
    </section>
  )
}
