import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { stepsOf } from '../chapters'
import { load, save } from './storage'
import { currentLang, trackOnce } from './track'

// progress is stored per chapter slug and step id — both are language independent,
// so switching the language keeps the progress
type ProgressState = Record<string, string[]>

type Progress = {
  isDone: (chapter: string, step: string) => boolean
  toggle: (chapter: string, step: string) => void
  doneSteps: (chapter: string) => string[]
  setChapter: (chapter: string, steps: string[]) => void
  reset: () => void
}

const KEY = 'tutorial-progress-v1'

// Umami event `chapter-done-<slug>` when a chapter becomes complete (all steps done), either step by step or via
// the "mark chapter done" button. Fires once per browser, on the transition to complete.
function trackChapterDone(chapter: string, before: string[], after: string[], via: 'steps' | 'button') {
  const steps = stepsOf(chapter)
  const complete = (done: string[]) => steps.length > 0 && steps.every((s) => done.includes(s))
  if (!complete(before) && complete(after)) trackOnce(chapter, `chapter-done-${chapter}`, { via, lang: currentLang() })
}
const ProgressContext = createContext<Progress | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  // empty while prerendering, the stored progress is read after hydration
  const [state, setState] = useState<ProgressState>({})
  useEffect(() => setState(load<ProgressState>(KEY, {})), [])

  const update = useCallback((next: ProgressState) => {
    setState(next)
    save(KEY, next)
  }, [])

  const isDone = (chapter: string, step: string) => state[chapter]?.includes(step) ?? false

  const toggle = (chapter: string, step: string) => {
    const current = state[chapter] ?? []
    const nextSteps = current.includes(step) ? current.filter((s) => s !== step) : [...current, step]
    update({ ...state, [chapter]: nextSteps })
    if (!current.includes(step)) {
      trackOnce(`${chapter}/${step}`, `step-done-${chapter}`, { step, lang: currentLang() })
      trackChapterDone(chapter, current, nextSteps, 'steps')
    }
  }

  const doneSteps = (chapter: string) => state[chapter] ?? []

  const setChapter = (chapter: string, steps: string[]) => {
    trackChapterDone(chapter, state[chapter] ?? [], steps, 'button')
    update({ ...state, [chapter]: steps })
  }

  return (
    <ProgressContext.Provider value={{ isDone, toggle, doneSteps, setChapter, reset: () => update({}) }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider')
  return ctx
}
