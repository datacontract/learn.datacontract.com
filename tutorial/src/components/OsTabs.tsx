import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'
import { usePrefs, type Os } from '../state/prefs'

const LABELS: Record<Os, string> = { unix: 'macOS / Linux', windows: 'Windows' }

export function Os({ children }: { name: Os; children: ReactNode }) {
  return <>{children}</>
}

// Shows OS-specific instructions. The selection is global and remembered.
export function OsTabs({ children }: { children: ReactNode }) {
  const { os, setOs } = usePrefs()
  const tabs = Children.toArray(children).filter(isValidElement) as ReactElement<{ name: Os; children: ReactNode }>[]
  const active = tabs.find((tab) => tab.props.name === os) ?? tabs[0]

  return (
    <div className="my-4">
      <div role="tablist" className="not-prose inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800/80">
        {tabs.map((tab) => (
          <button
            key={tab.props.name}
            role="tab"
            type="button"
            aria-selected={tab === active}
            onClick={() => setOs(tab.props.name)}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
              tab === active
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {LABELS[tab.props.name]}
          </button>
        ))}
      </div>
      <div className="prose prose-slate max-w-none dark:prose-invert">{active}</div>
    </div>
  )
}
