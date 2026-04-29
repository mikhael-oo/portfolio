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
    <nav className="nav">
      <a href="#" className="nav-logo">Mikhael<em>.</em></a>
      <ul className="nav-links">
        <li><a href="#about">About</a></li>
        <li><a href="#work">Work</a></li>
        <li><a href="#experience">Experience</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="nav-resume">
        Resume ↗
      </a>
      <button className="theme-btn" onClick={handleToggle} aria-label="Toggle theme">
        {theme === 'light' ? '◐' : '○'}
      </button>
    </nav>
  )
}
