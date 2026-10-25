import { useEffect, useLayoutEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'sticky-notes:theme'
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')

const loadPreference = (): Theme | null => {
  try {
    const saved = localStorage.getItem(KEY)
    return saved === 'light' || saved === 'dark' ? saved : null
  } catch {
    return null
  }
}

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#191d18' : '#f5f4ef')
}

const initialPreference = loadPreference()
applyTheme(initialPreference ?? (systemTheme.matches ? 'dark' : 'light'))

export const useTheme = () => {
  const [preference, setPreference] = useState<Theme | null>(initialPreference)
  const [systemDark, setSystemDark] = useState<boolean>(systemTheme.matches)
  const theme = preference ?? (systemDark ? 'dark' : 'light')

  useEffect(() => {
    const onChange = (event: MediaQueryListEvent) =>
      setSystemDark(event.matches)
    systemTheme.addEventListener('change', onChange)
    return () => systemTheme.removeEventListener('change', onChange)
  }, [])

  useLayoutEffect(() => applyTheme(theme), [theme])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setPreference(next)
    try {
      localStorage.setItem(KEY, next)
    } catch (error) {
      console.warn('Could not save theme preference', error)
    }
  }

  return { theme, toggleTheme }
}
