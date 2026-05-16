// components/nav/Nav.tsx
'use client'
import { useEffect, useState } from 'react'
import { THEME_KEY, type Theme, toggleTheme } from '@/lib/theme'

export default function Nav() {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    setTheme((localStorage.getItem(THEME_KEY) as Theme) ?? 'light')
  }, [])

  function handleToggle() {
    setTheme(toggleTheme())
  }

  return (
    <div className="nav-wrap">
      <nav className="nav">
        <a href="#" className="nav-logo">M<span className="nav-logo-full">ikhael</span><em>.</em></a>
        <div className="nav-right">
          <ul className="nav-links">
            <li>
              <a href="#about" aria-label="About">
                <span className="nav-link-text">About</span>
                <svg className="nav-link-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="8" cy="5.5" r="2.5"/><path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>
              </a>
            </li>
            <li>
              <a href="#work" aria-label="Work">
                <span className="nav-link-text">Work</span>
                <svg className="nav-link-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="1.5" y="5" width="13" height="9" rx="1.5"/><path d="M5 5V3.5A1.5 1.5 0 0 1 6.5 2h3A1.5 1.5 0 0 1 11 3.5V5"/><line x1="1.5" y1="9" x2="14.5" y2="9"/></svg>
              </a>
            </li>
            <li>
              <a href="#experience" aria-label="Experience">
                <span className="nav-link-text">Experience</span>
                <svg className="nav-link-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M8 1.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6L8 9.8 4.8 11.4l.6-3.6L2.8 5.3l3.6-.5z"/></svg>
              </a>
            </li>
            <li>
              <a href="#contact" aria-label="Contact">
                <span className="nav-link-text">Contact</span>
                <svg className="nav-link-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="1" y="4" width="14" height="9" rx="1.5"/><path d="M1 5.5l7 4.5 7-4.5"/></svg>
              </a>
            </li>
          </ul>
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="nav-resume">
            Resume ↗
          </a>
          <button className="theme-btn" onClick={handleToggle} aria-label="Toggle theme">
            {theme === 'light' ? '◐' : '○'}
          </button>
        </div>
      </nav>
    </div>
  )
}
