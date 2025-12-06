import { useEffect, useState, useCallback } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const THEME_KEY = 'clever-invest-theme'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system'
    return (localStorage.getItem(THEME_KEY) as Theme) || 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  // Определяем итоговую тему (для system - берём из prefers-color-scheme)
  useEffect(() => {
    const root = document.documentElement
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const resolved = theme === 'system' ? systemTheme : theme
    
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
    setResolvedTheme(resolved)
    localStorage.setItem(THEME_KEY, theme)

    // Обновляем meta theme-color для мобильных браузеров
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      metaTheme.setAttribute('content', resolved === 'dark' ? '#0f172a' : '#ffffff')
    }
  }, [theme])

  // Слушаем изменения системной темы
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement
      const newTheme = e.matches ? 'dark' : 'light'
      root.classList.remove('light', 'dark')
      root.classList.add(newTheme)
      setResolvedTheme(newTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'system'
      return 'light'
    })
  }, [])

  return { 
    theme, 
    setTheme, 
    toggleTheme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark'
  }
}
