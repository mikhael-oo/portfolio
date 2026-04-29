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
