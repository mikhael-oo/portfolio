# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Next.js 15 App Router portfolio site from scratch at `/Users/mikhael/Documents/Projects/portfolio` with a 3D interactive globe hero, smooth scroll, and light/dark mode.

**Architecture:** Next.js App Router + TypeScript. All styles in `globals.css` using CSS custom properties. Theme stored in `localStorage` with a blocking `next/script` init tag to prevent FOUC. Globe is React Three Fiber + Three.js, mounted via `dynamic()` with `ssr: false`. Scroll animations via Framer Motion `useInView`.

**Tech Stack:** Next.js 15 · TypeScript · React 18 · @react-three/fiber v8 · three@0.165 · @react-three/drei v9 · framer-motion · lenis · Plus Jakarta Sans

**Design spec:** `docs/superpowers/specs/2026-04-29-portfolio-redesign-design.md`

---

## File Map

```
app/
  layout.tsx              — root layout: font, theme init script, Lenis wrapper
  page.tsx                — assembles all section components
  globals.css             — ALL styles (CSS custom props + every class used)

components/
  nav/Nav.tsx             — sticky nav, logo, links, resume btn, theme toggle
  hero/Hero.tsx           — hero section: canvas wrap, vignette, text overlay
  hero/Globe.tsx          — R3F Canvas + GlobeScene (dynamic, ssr:false)
  about/About.tsx         — about section: bio + stack panel
  projects/Projects.tsx   — projects section: typographic row list
  experience/Experience.tsx — experience section: rows with role pills
  contact/Contact.tsx     — contact section: copy-email btn, socials
  ui/FadeUp.tsx           — Framer Motion scroll-reveal wrapper

lib/
  theme.ts                — THEME_KEY, Theme type, getTheme, setTheme, toggleTheme
  lenis.tsx               — 'use client' Lenis provider

public/
  resume.pdf              — (add manually)
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json` (via create-next-app)
- Create: `tsconfig.json`
- Create: `next.config.ts`

- [ ] **Step 1: Bootstrap Next.js app**

```bash
cd /Users/mikhael/Documents/Projects
npx create-next-app@latest portfolio --typescript --app --no-tailwind --no-eslint --no-src-dir --import-alias "@/*"
cd portfolio
```

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install @react-three/fiber@^8.18 three@^0.165 @react-three/drei@^9.122 framer-motion lenis
npm install -D @types/three
```

- [ ] **Step 3: Remove boilerplate**

Delete `app/page.module.css`. Replace `app/page.tsx`:
```tsx
export default function Home() {
  return <main>Portfolio</main>
}
```

- [ ] **Step 4: Verify TypeScript compiles clean**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: scaffold Next.js 15 portfolio project"
```

---

## Task 2: CSS Foundation

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace globals.css entirely**

```css
/* app/globals.css */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html[data-theme="light"] {
  --bg: #FAFAF9; --bg-alt: #F5F3F0; --surface: #FFFFFF;
  --text: #111110; --text-muted: #6B6560; --text-dim: #C0BCB7;
  --border: rgba(0,0,0,0.07); --border-mid: rgba(0,0,0,0.13);
  --accent: #B9314F; --accent2: #C8601A;
  --accent-glow: rgba(185,49,79,0.09);
  --chip-bg: rgba(0,0,0,0.04);
}
html[data-theme="dark"] {
  --bg: #0D0C0B; --bg-alt: #131210; --surface: #1C1917;
  --text: #F0EDE8; --text-muted: #7A7268; --text-dim: #3D3A37;
  --border: rgba(255,255,255,0.07); --border-mid: rgba(255,255,255,0.13);
  --accent: #C94060; --accent2: #D5813A;
  --accent-glow: rgba(201,64,96,0.12);
  --chip-bg: rgba(255,255,255,0.05);
}

html { transition: background 0.4s, color 0.3s; scroll-behavior: auto; }

body {
  font-family: var(--font-sans), system-ui, sans-serif;
  background: var(--bg); color: var(--text);
  -webkit-font-smoothing: antialiased;
}

/* Shared */
.section     { padding: 112px 48px; position: relative; }
.section-alt { padding: 112px 48px; position: relative; background: var(--bg-alt); }

.eyebrow {
  font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--accent); margin-bottom: 14px;
}
.section-title {
  font-size: clamp(36px,4.5vw,56px); font-weight: 800;
  letter-spacing: -0.035em; color: var(--text); line-height: 1.0;
  margin-bottom: 64px;
}
.gradient-text {
  background: linear-gradient(118deg, var(--accent) 0%, var(--accent2) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.chip {
  font-size: 11px; font-weight: 500; letter-spacing: 0.04em;
  padding: 4px 10px; border-radius: 6px;
  color: var(--text-muted); background: var(--chip-bg);
  border: 1px solid var(--border);
  transition: border-color 0.15s, color 0.15s;
}
.chip:hover { border-color: var(--border-mid); color: var(--text); }
.chips { display: flex; flex-wrap: wrap; gap: 5px; }

/* ── Nav ── */
.nav {
  display: flex; align-items: center; padding: 16px 48px;
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  position: sticky; top: 0; z-index: 100;
}
.nav-logo {
  font-size: 15px; font-weight: 800; color: var(--text);
  margin-right: auto; letter-spacing: -0.02em; text-decoration: none;
}
.nav-logo em { color: var(--accent); font-style: normal; }
.nav-links { display: flex; gap: 2px; list-style: none; }
.nav-links a {
  font-size: 12px; color: var(--text-muted); text-decoration: none;
  padding: 6px 14px; border-radius: 8px;
  transition: color 0.15s, background 0.15s;
}
.nav-links a:hover { color: var(--text); background: var(--chip-bg); }
.nav-resume {
  margin-left: 16px; font-size: 12px; font-weight: 500;
  color: var(--text); background: var(--surface);
  border: 1px solid var(--border-mid); padding: 7px 16px;
  border-radius: 8px; cursor: pointer; font-family: inherit;
  text-decoration: none; transition: border-color 0.15s, background 0.15s;
}
.nav-resume:hover { background: var(--bg-alt); }
.theme-btn {
  margin-left: 10px; width: 34px; height: 34px; border-radius: 8px;
  border: 1px solid var(--border-mid); background: transparent;
  color: var(--text-muted); cursor: pointer; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  transition: color 0.15s, border-color 0.15s;
}
.theme-btn:hover { color: var(--text); }

/* ── Hero ── */
.hero {
  position: relative; height: 100vh; min-height: 640px;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; background: var(--bg);
}
.hero-canvas-wrap { position: absolute; inset: 0; z-index: 0; }
.hero-canvas-wrap canvas { cursor: grab; }
.hero-canvas-wrap canvas:active { cursor: grabbing; }
.hero-vignette {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: radial-gradient(
    ellipse 70% 65% at 50% 50%,
    transparent 0%,
    color-mix(in srgb, var(--bg) 55%, transparent) 55%,
    color-mix(in srgb, var(--bg) 95%, transparent) 100%
  );
}
.hero-content {
  position: relative; z-index: 2; text-align: center;
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; pointer-events: none;
}
.hero-name { font-size: 13px; font-weight: 500; color: var(--text-muted); letter-spacing: 0.04em; }
.hero-headline {
  font-size: clamp(36px,5.5vw,72px); font-weight: 800;
  letter-spacing: -0.04em; color: var(--text); line-height: 1.0;
  max-width: 640px;
}
.hero-sub {
  font-size: 16px; color: var(--text-muted); font-weight: 400;
  max-width: 360px; line-height: 1.6; margin-top: 4px;
}
.hero-cta {
  margin-top: 12px; font-family: inherit; font-size: 14px; font-weight: 500;
  color: var(--text); background: var(--surface);
  border: 1px solid var(--border-mid); padding: 11px 24px;
  border-radius: 10px; cursor: pointer; pointer-events: all;
  text-decoration: none; transition: border-color 0.2s, color 0.2s;
  letter-spacing: -0.01em;
}
.hero-cta:hover { border-color: var(--accent); color: var(--accent); }
.hero-scroll-hint {
  position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
  font-size: 11px; color: var(--text-dim); letter-spacing: 0.14em;
  text-transform: uppercase; z-index: 2;
  animation: bob 2s ease-in-out infinite;
}
@keyframes bob {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%       { transform: translateX(-50%) translateY(6px); }
}

/* ── About ── */
.about-layout { display: grid; grid-template-columns: 1fr 380px; gap: 96px; align-items: start; }
.about-pull {
  font-size: clamp(22px,2.8vw,32px); font-weight: 300;
  color: var(--text); line-height: 1.35; letter-spacing: -0.02em; margin-bottom: 28px;
}
.about-pull em { color: var(--accent); font-style: normal; font-weight: 400; }
.about-body { font-size: 15px; color: var(--text-muted); line-height: 1.8; margin-bottom: 14px; }
.stats { display: flex; gap: 48px; margin-top: 48px; padding-top: 36px; border-top: 1px solid var(--border); }
.stat-val {
  display: block; font-size: 36px; font-weight: 800; letter-spacing: -0.04em;
  background: linear-gradient(118deg, var(--accent), var(--accent2));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.stat-lbl { display: block; font-size: 11px; color: var(--text-muted); margin-top: 4px; letter-spacing: 0.06em; text-transform: uppercase; }
.stack-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
.stack-panel-head { padding: 18px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.stack-panel-head span { font-size: 11px; font-weight: 600; color: var(--text-muted); letter-spacing: 0.12em; text-transform: uppercase; }
.stack-panel-head em { font-size: 11px; color: var(--accent); font-style: normal; font-weight: 500; }
.stack-item { display: flex; align-items: center; justify-content: space-between; padding: 13px 24px; border-bottom: 1px solid var(--border); transition: background 0.15s; }
.stack-item:last-child { border-bottom: none; }
.stack-item:hover { background: var(--chip-bg); }
.stack-name { font-size: 14px; font-weight: 500; color: var(--text); }
.stack-tag { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); }
.stack-tag.core { color: var(--accent); opacity: 0.8; }

/* ── Projects ── */
.proj-list { border-top: 1px solid var(--border); }
.proj-row {
  display: grid; grid-template-columns: 56px 1fr auto;
  gap: 32px; padding: 36px 0; border-bottom: 1px solid var(--border);
  align-items: center; cursor: pointer; position: relative;
  transition: background 0.2s; text-decoration: none; color: inherit;
  margin: 0 -48px; padding-left: 48px; padding-right: 48px;
}
.proj-row::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: var(--accent); transform: scaleY(0); transform-origin: top;
  transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
  border-radius: 0 2px 2px 0;
}
.proj-row:hover { background: var(--chip-bg); }
.proj-row:hover::before { transform: scaleY(1); }
.proj-num { font-size: 13px; font-weight: 700; color: var(--text-dim); letter-spacing: 0.04em; font-variant-numeric: tabular-nums; transition: color 0.2s; }
.proj-row:hover .proj-num { color: var(--accent); }
.proj-title { font-size: 20px; font-weight: 800; letter-spacing: -0.025em; color: var(--text); margin-bottom: 6px; transition: color 0.2s; }
.proj-row:hover .proj-title { color: var(--accent); }
.proj-desc { font-size: 13px; color: var(--text-muted); line-height: 1.6; max-width: 560px; margin-bottom: 12px; }
.proj-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.proj-chip { font-size: 11px; font-weight: 500; letter-spacing: 0.03em; padding: 3px 9px; border-radius: 5px; color: var(--text-muted); background: var(--chip-bg); border: 1px solid var(--border); }
.proj-right { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; flex-shrink: 0; }
.proj-impact { font-size: 12px; font-weight: 600; color: var(--accent); text-align: right; opacity: 0; transform: translateX(6px); transition: opacity 0.2s, transform 0.2s; }
.proj-row:hover .proj-impact { opacity: 1; transform: translateX(0); }
.proj-arrow-btn {
  width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--border-mid);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; color: var(--text-muted); transition: all 0.2s; flex-shrink: 0;
  background: transparent; cursor: pointer; font-family: inherit;
}
.proj-row:hover .proj-arrow-btn { border-color: var(--accent); color: var(--accent); background: var(--accent-glow); transform: rotate(45deg); }

/* ── Experience ── */
.exp-list { border-top: 1px solid var(--border); }
.exp-row {
  display: grid; grid-template-columns: 1fr auto;
  padding: 40px 0; border-bottom: 1px solid var(--border);
  gap: 40px; align-items: start; transition: background 0.15s;
  border-radius: 6px; margin: 0 -8px; padding-left: 8px; padding-right: 8px;
}
.exp-row:hover { background: var(--chip-bg); }
.exp-top { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 10px; }
.exp-company { font-size: 20px; font-weight: 800; color: var(--text); letter-spacing: -0.025em; line-height: 1; }
.exp-role { font-size: 12px; font-weight: 600; color: var(--accent); background: var(--accent-glow); padding: 3px 10px; border-radius: 20px; letter-spacing: 0.02em; }
.exp-desc { font-size: 14px; color: var(--text-muted); line-height: 1.75; max-width: 560px; margin-bottom: 16px; }
.exp-right { text-align: right; flex-shrink: 0; }
.exp-dates { font-size: 13px; font-weight: 500; color: var(--text-muted); white-space: nowrap; display: block; }
.exp-loc { font-size: 12px; color: var(--text-dim); margin-top: 4px; display: block; }

/* ── Contact ── */
.contact { padding: 140px 48px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; overflow: hidden; }
.contact-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-60%); width: 700px; height: 400px; background: radial-gradient(ellipse, var(--accent-glow), transparent 70%); pointer-events: none; }
.contact-title { font-size: clamp(44px,8vw,96px); font-weight: 800; letter-spacing: -0.045em; color: var(--text); line-height: 1.0; position: relative; z-index: 1; margin-top: 20px; }
.contact-sub { font-size: 16px; color: var(--text-muted); margin: 20px 0 40px; line-height: 1.65; max-width: 400px; position: relative; z-index: 1; }
.email-btn { font-family: inherit; font-size: clamp(15px,2.2vw,22px); font-weight: 500; color: var(--text); background: var(--surface); border: 1px solid var(--border-mid); padding: 16px 36px; border-radius: 14px; cursor: pointer; position: relative; z-index: 1; transition: border-color 0.2s, color 0.2s; letter-spacing: -0.01em; }
.email-btn:hover { border-color: var(--accent); color: var(--accent); }
.contact-links { display: flex; gap: 28px; margin-top: 48px; position: relative; z-index: 1; }
.contact-links a { font-size: 13px; color: var(--text-dim); text-decoration: none; transition: color 0.15s; letter-spacing: 0.02em; }
.contact-links a:hover { color: var(--text-muted); }
.copyright { font-size: 11px; color: var(--text-dim); margin-top: 64px; position: relative; z-index: 1; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .section, .section-alt { padding: 80px 24px; }
  .about-layout { grid-template-columns: 1fr; gap: 48px; }
  .proj-row { grid-template-columns: 40px 1fr; margin: 0 -24px; padding-left: 24px; padding-right: 24px; }
  .proj-right { display: none; }
  .exp-row { grid-template-columns: 1fr; }
  .exp-right { text-align: left; }
  .contact { padding: 100px 24px; }
  .nav { padding: 14px 24px; }
  .nav-links { display: none; }
}
@media (max-width: 600px) {
  .hero-headline { font-size: clamp(30px,9vw,48px); }
  .stats { gap: 28px; }
  .stat-val { font-size: 28px; }
}
```

- [ ] **Step 2: Verify dev server has no CSS errors**

```bash
npm run dev
```
Open http://localhost:3000. Check browser console — no parse errors.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: full CSS design system — tokens, all section styles, responsive"
```

---

## Task 3: Theme System + Root Layout

**Files:**
- Create: `lib/theme.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create lib/theme.ts**

```ts
// lib/theme.ts
export const THEME_KEY = 'portfolio-theme'
export type Theme = 'light' | 'dark'

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return (localStorage.getItem(THEME_KEY) as Theme) ?? 'light'
}

export function setTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme)
  document.documentElement.setAttribute('data-theme', theme)
}

export function toggleTheme(): Theme {
  const next = getTheme() === 'light' ? 'dark' : 'light'
  setTheme(next)
  return next
}
```

- [ ] **Step 2: Replace app/layout.tsx**

The FOUC-prevention script runs before hydration using `next/script` with `strategy="beforeInteractive"`.

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import Script from 'next/script'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mikhael Opeyemi-Olatunji — Software Engineer',
  description: 'Full-stack engineer based in Vancouver, BC. Currently at Splunk.',
  metadataBase: new URL('https://mikhaelcodes.dev'),
  alternates: { canonical: 'https://mikhaelcodes.dev' },
  openGraph: {
    title: 'Mikhael Opeyemi-Olatunji',
    description: 'Full-stack engineer based in Vancouver, BC.',
    url: 'https://mikhaelcodes.dev',
    siteName: 'mikhaelcodes.dev',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mikhael Opeyemi-Olatunji',
    creator: '@tha_mikky',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className={sans.variable}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){var t=localStorage.getItem('portfolio-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');})()`}
        </Script>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Verify FOUC prevention**

Open http://localhost:3000. Toggle to dark mode. Hard-reload (`Cmd+Shift+R`) — page should load dark immediately with no white flash.

- [ ] **Step 5: Commit**

```bash
git add lib/theme.ts app/layout.tsx
git commit -m "feat: theme system with FOUC-prevention script and Plus Jakarta Sans font"
```

---

## Task 4: Lenis Smooth Scroll

**Files:**
- Create: `lib/lenis.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create lib/lenis.tsx**

```tsx
// lib/lenis.tsx
'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, duration: 1.2 })
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])
  return <>{children}</>
}
```

- [ ] **Step 2: Wrap body children in layout.tsx**

```tsx
// app/layout.tsx — add import at top:
import LenisProvider from '@/lib/lenis'

// replace body content:
<body className={sans.variable}>
  <Script id="theme-init" strategy="beforeInteractive">
    {`(function(){var t=localStorage.getItem('portfolio-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');})()`}
  </Script>
  <LenisProvider>
    {children}
  </LenisProvider>
</body>
```

- [ ] **Step 3: Commit**

```bash
git add lib/lenis.tsx app/layout.tsx
git commit -m "feat: Lenis smooth scroll provider"
```

---

## Task 5: Navigation

**Files:**
- Create: `components/nav/Nav.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create components/nav/Nav.tsx**

```tsx
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
```

- [ ] **Step 2: Add Nav to page.tsx**

```tsx
// app/page.tsx
import Nav from '@/components/nav/Nav'

export default function Home() {
  return (
    <main>
      <Nav />
      <div style={{ height: '200vh', padding: '48px' }}>scroll test</div>
    </main>
  )
}
```

- [ ] **Step 3: Visual verify**

Open http://localhost:3000. Nav is sticky at top. Logo shows `Mikhael.` with red dot. Theme toggle switches `data-theme` on `<html>` — colors change. Reload in dark mode — no flash (FOUC prevention confirmed).

- [ ] **Step 4: Commit**

```bash
git add components/nav/Nav.tsx app/page.tsx
git commit -m "feat: sticky nav with theme toggle"
```

---

## Task 6: Hero Text Layer

**Files:**
- Create: `components/hero/Hero.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create components/hero/Hero.tsx**

```tsx
// components/hero/Hero.tsx
export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-canvas-wrap" />
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
```

- [ ] **Step 2: Update page.tsx**

```tsx
import Nav from '@/components/nav/Nav'
import Hero from '@/components/hero/Hero'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
    </main>
  )
}
```

- [ ] **Step 3: Visual verify**

Full-viewport hero with centered text, gradient on headline, bobbing scroll hint. Background plain for now.

- [ ] **Step 4: Commit**

```bash
git add components/hero/Hero.tsx app/page.tsx
git commit -m "feat: hero section text layer"
```

---

## Task 7: Globe 3D Component

**Files:**
- Create: `components/hero/Globe.tsx`
- Modify: `components/hero/Hero.tsx`

- [ ] **Step 1: Create components/hero/Globe.tsx**

```tsx
// components/hero/Globe.tsx
'use client'
import { useRef, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const R = 2.8
const N = 300
const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const NUM_TRAVELERS = 45

interface GlobeNode { pos: THREE.Vector3; tier: 'major' | 'minor' | 'micro' }
interface GlobeArc  { a: number; b: number; points: THREE.Vector3[] }
interface Traveler  { arcIdx: number; t: number; speed: number; layer: 0 | 1 }

function buildNodes(): GlobeNode[] {
  const nodes: GlobeNode[] = []
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = GOLDEN * i
    nodes.push({
      pos: new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r)
        .multiplyScalar(R),
      tier: i < 14 ? 'major' : i < 84 ? 'minor' : 'micro',
    })
  }
  return nodes
}

function buildArcs(nodes: GlobeNode[]): GlobeArc[] {
  const arcs: GlobeArc[] = []
  const BOW = 0.35
  const THRESH = 1.6
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i]
    const maxConn = a.tier === 'major' ? 5 : a.tier === 'minor' ? 3 : 2
    let count = 0
    for (let j = i + 1; j < nodes.length && count < maxConn; j++) {
      if (a.pos.distanceTo(nodes[j].pos) >= THRESH) continue
      const b = nodes[j]
      const dist = a.pos.distanceTo(b.pos)
      const mid = a.pos.clone().add(b.pos).multiplyScalar(0.5)
        .normalize().multiplyScalar(R + dist * BOW)
      const pts: THREE.Vector3[] = []
      for (let k = 0; k <= 24; k++) {
        const t = k / 24, u = 1 - t
        pts.push(
          a.pos.clone().multiplyScalar(u * u)
            .add(mid.clone().multiplyScalar(2 * u * t))
            .add(b.pos.clone().multiplyScalar(t * t))
        )
      }
      arcs.push({ a: i, b: j, points: pts })
      count++
    }
  }
  return arcs
}

function GlobeScene() {
  const { gl } = useThree()
  const groupRef   = useRef<THREE.Group>(null)
  const velX       = useRef(0)
  const velY       = useRef(0.004)
  const dragging   = useRef(false)
  const lastMouse  = useRef({ x: 0, y: 0 })
  const travelers  = useRef<Traveler[]>([])
  const travMesh   = useRef<[THREE.Points, THREE.Points] | null>(null)
  const pulseRings = useRef<THREE.Mesh[]>([])
  const timeRef    = useRef(0)
  const arcsRef    = useRef<GlobeArc[]>([])

  const initScene = useCallback((group: THREE.Group) => {
    const nodes = buildNodes()
    const arcs  = buildArcs(nodes)
    arcsRef.current = arcs

    // Node point clouds
    const majPos: number[] = [], minPos: number[] = [], micPos: number[] = []
    nodes.forEach(n => {
      const arr = n.tier === 'major' ? majPos : n.tier === 'minor' ? minPos : micPos
      arr.push(n.pos.x, n.pos.y, n.pos.z)
    })
    const mkPoints = (pos: number[], size: number, opacity: number) => {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
      return new THREE.Points(geo, new THREE.PointsMaterial({
        size, opacity, transparent: true, color: 0xffffff,
        sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
      }))
    }
    group.add(mkPoints(majPos, 0.08, 0.9))
    group.add(mkPoints(minPos, 0.055, 0.75))
    group.add(mkPoints(micPos, 0.035, 0.5))

    // Arcs
    arcs.forEach(arc => {
      const geo = new THREE.BufferGeometry().setFromPoints(arc.points)
      group.add(new THREE.Line(geo, new THREE.LineBasicMaterial({
        color: 0xffffff, opacity: 0.18, transparent: true,
        depthWrite: false, blending: THREE.AdditiveBlending,
      })))
    })

    // Travelers
    const tvList: Traveler[] = []
    const p0: number[] = [], p1: number[] = []
    for (let i = 0; i < NUM_TRAVELERS * 2; i++) {
      const layer = (i < NUM_TRAVELERS ? 0 : 1) as 0 | 1
      const arcIdx = Math.floor(Math.random() * arcs.length)
      const t = Math.random()
      tvList.push({ arcIdx, t, speed: 0.003 + Math.random() * 0.004, layer })
      const pt = arcs[arcIdx].points[Math.floor(t * (arcs[arcIdx].points.length - 1))]
      ;(layer === 0 ? p0 : p1).push(pt.x, pt.y, pt.z)
    }
    travelers.current = tvList
    const mkTrav = (pos: number[], color: number, size: number, opacity: number) => {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
      return new THREE.Points(geo, new THREE.PointsMaterial({
        size, color, opacity, transparent: true,
        sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
      }))
    }
    const t0 = mkTrav(p0, 0xffffff, 0.06, 1.0)
    const t1 = mkTrav(p1, 0xD5813A, 0.07, 0.85)
    group.add(t0, t1)
    travMesh.current = [t0, t1]

    // Pulsing rings
    const rings = [0, Math.PI / 2, Math.PI / 4].map(angle => {
      const m = new THREE.Mesh(
        new THREE.RingGeometry(R - 0.02, R + 0.02, 96),
        new THREE.MeshBasicMaterial({
          color: 0xffffff, opacity: 0.12, transparent: true,
          side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
        })
      )
      m.rotation.x = angle
      group.add(m)
      return m
    })
    pulseRings.current = rings

    // Atmosphere shell
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(R + 0.25, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0xffffff, opacity: 0.025, transparent: true,
        side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending,
      })
    ))
  }, [])

  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    initScene(group)

    const canvas = gl.domElement
    const onDown = (e: PointerEvent) => {
      dragging.current = true
      lastMouse.current = { x: e.clientX, y: e.clientY }
      velX.current = 0; velY.current = 0
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      velY.current = (e.clientX - lastMouse.current.x) * 0.008
      velX.current = (e.clientY - lastMouse.current.y) * 0.008
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }
    const onUp = () => { dragging.current = false }

    canvas.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [gl, initScene])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return
    timeRef.current += delta

    if (!dragging.current) {
      velY.current *= 0.95; velX.current *= 0.95
      if (Math.abs(velY.current) < 0.001) velY.current = 0.004
    }
    group.rotation.y += velY.current
    group.rotation.x = Math.max(
      -Math.PI / 4,
      Math.min(Math.PI / 4, group.rotation.x + velX.current)
    )

    pulseRings.current.forEach((ring, i) => {
      ;(ring.material as THREE.MeshBasicMaterial).opacity =
        0.08 + 0.08 * Math.sin(timeRef.current * 1.2 + i * 1.4)
    })

    const arcs = arcsRef.current
    const tm = travMesh.current
    if (!arcs.length || !tm) return
    const [t0, t1] = tm
    const pos0 = t0.geometry.attributes.position
    const pos1 = t1.geometry.attributes.position
    let i0 = 0, i1 = 0
    travelers.current.forEach(tr => {
      tr.t = (tr.t + tr.speed * delta * 60) % 1
      const pts = arcs[tr.arcIdx].points
      const pt = pts[Math.floor(tr.t * (pts.length - 1))]
      if (tr.layer === 0) { pos0.setXYZ(i0++, pt.x, pt.y, pt.z) }
      else                { pos1.setXYZ(i1++, pt.x, pt.y, pt.z) }
    })
    pos0.needsUpdate = true
    pos1.needsUpdate = true
  })

  return (
    <group ref={groupRef}>
      <pointLight position={[0, 0, 0]} intensity={0.4} color={0xffffff} />
    </group>
  )
}

export default function Globe() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.5]}
      style={{ position: 'absolute', inset: 0 }}
    >
      <GlobeScene />
    </Canvas>
  )
}
```

- [ ] **Step 2: Wire Globe into Hero.tsx via dynamic import**

```tsx
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
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Visual verify globe**

Open http://localhost:3000. Globe renders with white nodes, arcs, white + orange travelers. Drag to spin; releases with inertia; auto-rotates when idle. Vignette blends globe into bg. Text centered inside globe. Toggle dark mode — globe unchanged, bg and text colors shift.

- [ ] **Step 5: Commit**

```bash
git add components/hero/Globe.tsx components/hero/Hero.tsx
git commit -m "feat: 3D interactive globe hero with drag-spin and travelers"
```

---

## Task 8: About Section

**Files:**
- Create: `components/about/About.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create components/about/About.tsx**

```tsx
// components/about/About.tsx
const STACK = [
  { name: 'React · TypeScript',         tag: 'Core',         core: true  },
  { name: 'Vue.js · Ruby on Rails',     tag: 'Core',         core: true  },
  { name: 'Next.js · Node.js',          tag: 'Core',         core: true  },
  { name: 'PostgreSQL · MongoDB',       tag: 'Data',         core: false },
  { name: 'Docker · GCP · AWS',         tag: 'Infra',        core: false },
  { name: 'Cypress · Jest · Storybook', tag: 'Testing',      core: false },
  { name: 'Three.js · Framer Motion',   tag: 'Creative',     core: false },
  { name: 'SPL · Jsonnet',              tag: 'Observability',core: false },
]

export default function About() {
  return (
    <section className="section-alt" id="about">
      <p className="eyebrow">About</p>
      <h2 className="section-title">Who I <span className="gradient-text">am.</span></h2>
      <div className="about-layout">
        <div>
          <p className="about-pull">
            I build software for the web — and I care deeply about how it{' '}
            <em>looks and feels.</em>
          </p>
          <p className="about-body">
            Based in Vancouver, BC. Full-stack engineer with a knack for selecting
            the right tool for each problem — from data-heavy enterprise dashboards
            to polished consumer products.
          </p>
          <p className="about-body">
            Beyond code, I find inspiration in poetry, martial arts, and somatic
            movement. I believe the best software is made by people who notice things.
          </p>
          <p className="about-body">
            Currently at Splunk building monitoring infrastructure. Previously at
            FreshPrep, DivTech, and BC Liquor Distribution Branch.
          </p>
          <div className="stats">
            <div><span className="stat-val">4+</span><span className="stat-lbl">Years exp.</span></div>
            <div><span className="stat-val">4</span><span className="stat-lbl">Companies</span></div>
            <div><span className="stat-val">B.Sc.</span><span className="stat-lbl">SFU · 2024</span></div>
          </div>
        </div>
        <div className="stack-panel">
          <div className="stack-panel-head">
            <span>Stack</span><em>Technologies</em>
          </div>
          {STACK.map(item => (
            <div key={item.name} className="stack-item">
              <span className="stack-name">{item.name}</span>
              <span className={`stack-tag${item.core ? ' core' : ''}`}>{item.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to page.tsx**

```tsx
import Nav from '@/components/nav/Nav'
import Hero from '@/components/hero/Hero'
import About from '@/components/about/About'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <About />
    </main>
  )
}
```

- [ ] **Step 3: Visual verify**

Scroll past hero — about section on alt bg. 2-col layout: bio + stats left, stack panel right. Stack panel rows hover with chip-bg. Check dark mode.

- [ ] **Step 4: Commit**

```bash
git add components/about/About.tsx app/page.tsx
git commit -m "feat: about section with stack panel"
```

---

## Task 9: Projects Section

**Files:**
- Create: `components/projects/Projects.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create components/projects/Projects.tsx**

```tsx
// components/projects/Projects.tsx
const PROJECTS = [
  {
    num: '01',
    title: 'Splunk Monitoring Dashboards',
    desc: 'Engineered data monitoring dashboards with optimized SPL queries and scalable Jsonnet templates. Built comprehensive testing pipelines with Jest, Cypress, and Storybook.',
    chips: ['React', 'TypeScript', 'SPL', 'Jsonnet', 'Cypress'],
    impact: '20% latency reduction',
    href: '#',
  },
  {
    num: '02',
    title: 'Personal Finance Manager',
    desc: 'Full-stack web application for tracking personal finances — budgeting, expense categorization, and reporting. PostgreSQL-backed REST API with a clean React frontend.',
    chips: ['React', 'Express', 'PostgreSQL', 'Tailwind'],
    impact: 'Personal project',
    href: '#',
  },
  {
    num: '03',
    title: 'DivTech Frontend',
    desc: 'Built frontend infrastructure with Next.js App Router and server components. Custom auth middleware securing protected routes across the application.',
    chips: ['Next.js', 'TypeScript', 'TailwindCSS', 'AWS'],
    impact: 'Contract',
    href: '#',
  },
  {
    num: '04',
    title: 'This Portfolio',
    desc: "Designed and built from scratch — 3D interactive globe, smooth scroll, dark/light mode. The site you're currently on.",
    chips: ['Next.js', 'React Three Fiber', 'Framer Motion', 'TypeScript'],
    impact: 'mikhaelcodes.dev',
    href: '#',
  },
]

export default function Projects() {
  return (
    <section className="section" id="work">
      <p className="eyebrow">Selected Work</p>
      <h2 className="section-title">Projects that <span className="gradient-text">matter.</span></h2>
      <div className="proj-list">
        {PROJECTS.map(p => (
          <a key={p.num} className="proj-row" href={p.href}>
            <span className="proj-num">{p.num}</span>
            <div>
              <div className="proj-title">{p.title}</div>
              <p className="proj-desc">{p.desc}</p>
              <div className="proj-chips">
                {p.chips.map(c => <span key={c} className="proj-chip">{c}</span>)}
              </div>
            </div>
            <div className="proj-right">
              <span className="proj-impact">{p.impact}</span>
              <button className="proj-arrow-btn" aria-label="Open project">↗</button>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to page.tsx**

```tsx
import Projects from '@/components/projects/Projects'
// add <Projects /> after <About />
```

- [ ] **Step 3: Visual verify**

4 full-width rows. Hover each: left accent bar slides in, title + number turn accent, impact fades in from right, arrow rotates 45°.

- [ ] **Step 4: Commit**

```bash
git add components/projects/Projects.tsx app/page.tsx
git commit -m "feat: projects section with typographic rows"
```

---

## Task 10: Experience Section

**Files:**
- Create: `components/experience/Experience.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create components/experience/Experience.tsx**

```tsx
// components/experience/Experience.tsx
const EXPERIENCE = [
  {
    company: 'Splunk',
    role: 'Software Engineer',
    dates: 'Jan 2025 – Present',
    location: 'Vancouver, BC',
    desc: 'Engineered data monitoring dashboards with optimized SPL queries, reducing latency by 20%. Designed scalable Jsonnet templates cutting cloud deployment setup by 25%. Built testing pipelines with Jest, Cypress, and Storybook + Loki, reducing regression issues by 15%.',
    chips: ['React', 'TypeScript', 'SPL', 'Jsonnet', 'Cypress', 'Loki', 'CI/CD'],
  },
  {
    company: 'Fresh Prep',
    role: 'Fullstack Developer',
    dates: 'Sep 2023 – Jan 2025',
    location: 'Vancouver, BC',
    desc: 'Spearheaded features using Vue.js and Ruby on Rails, driving a 10% surge in user engagement. Integrated Contentful CMS to streamline content management. Implemented UI testing with Mocha, Chai, and Puppeteer.',
    chips: ['Vue.js', 'Ruby on Rails', 'Docker', 'GCP', 'PostgreSQL', 'Mocha'],
  },
  {
    company: 'DivTech',
    role: 'Frontend Engineer · Contract',
    dates: 'Feb 2024 – Jun 2024',
    location: 'Vancouver, BC',
    desc: 'Built frontend infrastructure with Next.js App Router and server components for dynamic routing and SSR. Implemented custom auth middleware securing protected routes across the application.',
    chips: ['Next.js', 'TypeScript', 'TailwindCSS', 'ShadcnUI', 'PostgreSQL', 'AWS'],
  },
  {
    company: 'BC Liquor',
    role: 'Java Developer · Co-op',
    dates: 'May 2022 – Dec 2022',
    location: 'Vancouver, BC',
    desc: 'Developed a web app prototype replacing an expired WebEx subscription using Spring Boot. Monitored and debugged Java ETLs and maintained Oracle databases ensuring stable business operations.',
    chips: ['Spring Boot', 'Java', 'JavaScript', 'Oracle DB', 'ETLs'],
  },
]

export default function Experience() {
  return (
    <section className="section-alt" id="experience">
      <p className="eyebrow">Experience</p>
      <h2 className="section-title">Where I&apos;ve <span className="gradient-text">worked.</span></h2>
      <div className="exp-list">
        {EXPERIENCE.map(e => (
          <div key={e.company} className="exp-row">
            <div>
              <div className="exp-top">
                <span className="exp-company">{e.company}</span>
                <span className="exp-role">{e.role}</span>
              </div>
              <p className="exp-desc">{e.desc}</p>
              <div className="chips">
                {e.chips.map(c => <span key={c} className="chip">{c}</span>)}
              </div>
            </div>
            <div className="exp-right">
              <span className="exp-dates">{e.dates}</span>
              <span className="exp-loc">{e.location}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to page.tsx**

```tsx
import Experience from '@/components/experience/Experience'
// add <Experience /> after <Projects />
```

- [ ] **Step 3: Visual verify**

Experience section: 4 rows, company + role pill on left, date/location right-aligned. Hover rows show chip-bg highlight.

- [ ] **Step 4: Commit**

```bash
git add components/experience/Experience.tsx app/page.tsx
git commit -m "feat: experience section"
```

---

## Task 11: Contact Section + Full Page Assembly

**Files:**
- Create: `components/contact/Contact.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create components/contact/Contact.tsx**

```tsx
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
```

- [ ] **Step 2: Final page.tsx assembly**

```tsx
// app/page.tsx
import Nav from '@/components/nav/Nav'
import Hero from '@/components/hero/Hero'
import About from '@/components/about/About'
import Projects from '@/components/projects/Projects'
import Experience from '@/components/experience/Experience'
import Contact from '@/components/contact/Contact'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Contact />
    </main>
  )
}
```

- [ ] **Step 3: Visual verify full page**

Scroll through every section end-to-end. Email copy button: click → shows "Copied! ✓" for 2s, reverts.

- [ ] **Step 4: Commit**

```bash
git add components/contact/Contact.tsx app/page.tsx
git commit -m "feat: contact section — full page assembled"
```

---

## Task 12: Scroll Animations

**Files:**
- Create: `components/ui/FadeUp.tsx`
- Modify: `components/about/About.tsx`
- Modify: `components/projects/Projects.tsx`
- Modify: `components/experience/Experience.tsx`
- Modify: `components/contact/Contact.tsx`

- [ ] **Step 1: Create components/ui/FadeUp.tsx**

```tsx
// components/ui/FadeUp.tsx
'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface FadeUpProps {
  children: React.ReactNode
  delay?: number
  className?: string
  style?: React.CSSProperties
}

export default function FadeUp({ children, delay = 0, className, style }: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Wrap About.tsx content with FadeUp**

```tsx
// components/about/About.tsx — add import + wrap eyebrow, title, and layout columns:
import FadeUp from '@/components/ui/FadeUp'

export default function About() {
  return (
    <section className="section-alt" id="about">
      <FadeUp><p className="eyebrow">About</p></FadeUp>
      <FadeUp delay={0.05}>
        <h2 className="section-title">Who I <span className="gradient-text">am.</span></h2>
      </FadeUp>
      <div className="about-layout">
        <FadeUp delay={0.1}>
          <div>
            <p className="about-pull">
              I build software for the web — and I care deeply about how it{' '}
              <em>looks and feels.</em>
            </p>
            <p className="about-body">
              Based in Vancouver, BC. Full-stack engineer with a knack for selecting
              the right tool for each problem — from data-heavy enterprise dashboards
              to polished consumer products.
            </p>
            <p className="about-body">
              Beyond code, I find inspiration in poetry, martial arts, and somatic
              movement. I believe the best software is made by people who notice things.
            </p>
            <p className="about-body">
              Currently at Splunk building monitoring infrastructure. Previously at
              FreshPrep, DivTech, and BC Liquor Distribution Branch.
            </p>
            <div className="stats">
              <div><span className="stat-val">4+</span><span className="stat-lbl">Years exp.</span></div>
              <div><span className="stat-val">4</span><span className="stat-lbl">Companies</span></div>
              <div><span className="stat-val">B.Sc.</span><span className="stat-lbl">SFU · 2024</span></div>
            </div>
          </div>
        </FadeUp>
        <FadeUp delay={0.2}>
          <div className="stack-panel">
            <div className="stack-panel-head"><span>Stack</span><em>Technologies</em></div>
            {STACK.map(item => (
              <div key={item.name} className="stack-item">
                <span className="stack-name">{item.name}</span>
                <span className={`stack-tag${item.core ? ' core' : ''}`}>{item.tag}</span>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Wrap Projects.tsx rows with staggered FadeUp**

```tsx
// components/projects/Projects.tsx — add import + wrap eyebrow, title, and rows:
import FadeUp from '@/components/ui/FadeUp'

export default function Projects() {
  return (
    <section className="section" id="work">
      <FadeUp><p className="eyebrow">Selected Work</p></FadeUp>
      <FadeUp delay={0.05}>
        <h2 className="section-title">Projects that <span className="gradient-text">matter.</span></h2>
      </FadeUp>
      <div className="proj-list">
        {PROJECTS.map((p, i) => (
          <FadeUp key={p.num} delay={i * 0.07} style={{ display: 'block' }}>
            <a className="proj-row" href={p.href}>
              <span className="proj-num">{p.num}</span>
              <div>
                <div className="proj-title">{p.title}</div>
                <p className="proj-desc">{p.desc}</p>
                <div className="proj-chips">
                  {p.chips.map(c => <span key={c} className="proj-chip">{c}</span>)}
                </div>
              </div>
              <div className="proj-right">
                <span className="proj-impact">{p.impact}</span>
                <button className="proj-arrow-btn" aria-label="Open project">↗</button>
              </div>
            </a>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}
```

`style={{ display: 'block' }}` on the FadeUp wrapper preserves the full-width row layout since `.proj-row` uses negative horizontal margins.

- [ ] **Step 4: Wrap Experience.tsx rows with staggered FadeUp**

```tsx
// components/experience/Experience.tsx — add import + wrap eyebrow, title, and rows:
import FadeUp from '@/components/ui/FadeUp'

export default function Experience() {
  return (
    <section className="section-alt" id="experience">
      <FadeUp><p className="eyebrow">Experience</p></FadeUp>
      <FadeUp delay={0.05}>
        <h2 className="section-title">Where I&apos;ve <span className="gradient-text">worked.</span></h2>
      </FadeUp>
      <div className="exp-list">
        {EXPERIENCE.map((e, i) => (
          <FadeUp key={e.company} delay={i * 0.07}>
            <div className="exp-row">
              <div>
                <div className="exp-top">
                  <span className="exp-company">{e.company}</span>
                  <span className="exp-role">{e.role}</span>
                </div>
                <p className="exp-desc">{e.desc}</p>
                <div className="chips">
                  {e.chips.map(c => <span key={c} className="chip">{c}</span>)}
                </div>
              </div>
              <div className="exp-right">
                <span className="exp-dates">{e.dates}</span>
                <span className="exp-loc">{e.location}</span>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Add animation to Contact.tsx**

```tsx
// components/contact/Contact.tsx — add imports at top:
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

// Inside the component, before return:
const ref = useRef<HTMLElement>(null)
const inView = useInView(ref, { once: true, margin: '-60px' })

// Replace <section className="contact" id="contact"> with <motion.section ref={ref} ...>
// Replace <h2 className="contact-title"> with:
<motion.h2
  className="contact-title"
  initial={{ opacity: 0, y: 24 }}
  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
  transition={{ duration: 0.6, delay: 0.1 }}
>
  Let&apos;s build<br />
  something <span className="gradient-text">together.</span>
</motion.h2>

// The full updated Contact return:
return (
  <motion.section ref={ref} className="contact" id="contact">
    <div className="contact-glow" />
    <motion.p
      className="eyebrow"
      style={{ position: 'relative', zIndex: 1 }}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5 }}
    >Contact</motion.p>
    <motion.h2
      className="contact-title"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      Let&apos;s build<br />
      something <span className="gradient-text">together.</span>
    </motion.h2>
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
  </motion.section>
)
```

- [ ] **Step 6: Visual verify all animations**

Scroll slowly through the full page — every section fades up on enter, once only. No re-trigger on scroll up.

- [ ] **Step 7: Commit**

```bash
git add components/ui/FadeUp.tsx components/about/About.tsx components/projects/Projects.tsx components/experience/Experience.tsx components/contact/Contact.tsx
git commit -m "feat: scroll-triggered fade-up animations on all sections"
```

---

## Task 13: Production Build Verification

- [ ] **Step 1: TypeScript clean check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 2: Production build**

```bash
npm run build
```
Expected: exits 0.

- [ ] **Step 3: Smoke test production build**

```bash
npm start
```
Open http://localhost:3000 and verify everything renders.

- [ ] **Step 4: Final checklist**

- [ ] Globe renders and drag-spins — inertia decays, auto-spin resumes
- [ ] Hero text centered inside globe, vignette blends cleanly in both themes
- [ ] Light ↔ dark toggle works; reload in dark mode — no white flash
- [ ] Nav links smooth-scroll to sections (Lenis)
- [ ] All sections animate in on scroll (once only)
- [ ] Projects rows: accent bar slides in, impact reveals, arrow rotates on hover
- [ ] Experience rows: hover background appears, role pills visible
- [ ] Email copy button shows "Copied! ✓" for 2s then reverts
- [ ] Mobile (375px DevTools): nav collapses, sections stack, globe still renders
- [ ] No console errors

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: portfolio complete — all sections, animations, production verified"
```
