import { Children, createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { t } from '../i18n'
import { usePrefs, type Os } from '../state/prefs'
import { useChapter } from './ChapterContext'
import { CheckIcon, CopyIcon } from './icons'

export const TerminalContext = createContext(false)

export function useInTerminal() {
  return useContext(TerminalContext)
}

const OS_LABELS: Record<Os, string> = { unix: 'macOS / Linux', windows: 'Windows' }

// A terminal window with the macOS/Linux or Windows variant of a command, and optionally
// its example output (see plugins/remark-terminal.ts). The output is revealed line by line
// the first time the window scrolls into view.
export function Terminal({ children }: { children: ReactNode }) {
  const { os, setOs } = usePrefs()
  const { lang } = useChapter()
  const ui = t(lang)
  const [unix, windows, output] = Children.toArray(children)
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || !output) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.4 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [output])

  const copy = async () => {
    // copy the commands only: the prompts are CSS, the output is a separate <pre>
    const text = ref.current?.querySelector<HTMLElement>('pre:not([data-output])')?.innerText ?? ''
    try {
      await navigator.clipboard.writeText(text.replace(/\n$/, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard not available
    }
  }

  return (
    <TerminalContext.Provider value={true}>
      <div
        ref={ref}
        data-os={os}
        data-revealed={visible || !output ? 'true' : 'false'}
        className="terminal not-prose my-5 overflow-hidden rounded-xl bg-[#0d1117] shadow-lg ring-1 ring-slate-900/10 dark:ring-white/10"
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-3 py-2">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div role="tablist" className="flex items-center gap-1">
            {(Object.keys(OS_LABELS) as Os[]).map((value) => (
              <button
                key={value}
                role="tab"
                type="button"
                aria-selected={os === value}
                onClick={() => setOs(value)}
                className={`rounded-md px-2 py-0.5 text-xs font-medium transition ${
                  os === value ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {OS_LABELS[value]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={copy}
            aria-label={ui.copy}
            className="ml-auto flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            {copied ? <CheckIcon width={14} height={14} className="text-emerald-400" /> : <CopyIcon width={14} height={14} />}
            {copied ? ui.copied : ui.copy}
          </button>
        </div>
        <div className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-relaxed">
          {os === 'windows' ? windows : unix}
          {output}
        </div>
      </div>
    </TerminalContext.Provider>
  )
}
