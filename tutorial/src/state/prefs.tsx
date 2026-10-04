import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { load, save } from './storage'

export type Os = 'unix' | 'windows'
export type Theme = 'light' | 'dark'

type Prefs = {
  os: Os
  setOs: (os: Os) => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

const PrefsContext = createContext<Prefs | null>(null)

function detectOs(): Os {
  return /win/i.test(navigator.userAgent) && !/darwin|mac/i.test(navigator.userAgent) ? 'windows' : 'unix'
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [os, setOsState] = useState<Os>(() => load<Os>('tutorial-os', detectOs()))
  const [theme, setThemeState] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const setOs = (value: Os) => {
    setOsState(value)
    save('tutorial-os', value)
  }
  const setTheme = (value: Theme) => {
    setThemeState(value)
    try {
      localStorage.setItem('tutorial-theme', value)
    } catch {
      // ignore
    }
  }

  return <PrefsContext.Provider value={{ os, setOs, theme, setTheme }}>{children}</PrefsContext.Provider>
}

export function usePrefs() {
  const ctx = useContext(PrefsContext)
  if (!ctx) throw new Error('usePrefs must be used inside PrefsProvider')
  return ctx
}
