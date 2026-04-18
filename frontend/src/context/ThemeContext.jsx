import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'sb_theme'

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'dark'
    } catch {
      return 'dark'
    }
  })

  /* Apply theme to <html> so CSS vars cascade globally */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem(STORAGE_KEY, theme) } catch {}
  }, [theme])

  const setTheme = useCallback((t) => setThemeState(t), [])
  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
