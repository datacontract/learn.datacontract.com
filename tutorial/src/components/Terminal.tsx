import { Children, createContext, useContext, type ReactNode } from 'react'
import { usePrefs } from '../state/prefs'

export const TerminalContext = createContext(false)

export function useInTerminal() {
  return useContext(TerminalContext)
}

// Wraps a macOS/Linux and a Windows variant of a command (see plugins/remark-terminal.ts)
export function Terminal({ children }: { children: ReactNode }) {
  const { os } = usePrefs()
  const [unix, windows] = Children.toArray(children)
  return <TerminalContext.Provider value={true}>{os === 'windows' ? windows : unix}</TerminalContext.Provider>
}
