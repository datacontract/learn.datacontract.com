import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { load, save } from './storage'

// progress is stored per chapter slug and step id — both are language independent,
// so switching the language keeps the progress
type ProgressState = Record<string, string[]>

type Progress = {
  isDone: (chapter: string, step: string) => boolean
  toggle: (chapter: string, step: string) => void
  doneSteps: (chapter: string) => string[]
  reset: () => void
}

const KEY = 'tutorial-progress-v1'
const ProgressContext = createContext<Progress | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => load<ProgressState>(KEY, {}))

  const update = useCallback((next: ProgressState) => {
    setState(next)
    save(KEY, next)
  }, [])

  const isDone = (chapter: string, step: string) => state[chapter]?.includes(step) ?? false

  const toggle = (chapter: string, step: string) => {
    const current = state[chapter] ?? []
    const nextSteps = current.includes(step) ? current.filter((s) => s !== step) : [...current, step]
    update({ ...state, [chapter]: nextSteps })
  }

  const doneSteps = (chapter: string) => state[chapter] ?? []

  return (
    <ProgressContext.Provider value={{ isDone, toggle, doneSteps, reset: () => update({}) }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider')
  return ctx
}
