import { useRef, useState, type ComponentProps } from 'react'
import { t } from '../i18n'
import { useChapter } from './ChapterContext'
import { CheckIcon, CopyIcon } from './icons'
import { usePrefs, type Os } from '../state/prefs'
import { useInTerminal } from './Terminal'

const OS_LABELS: Record<Os, string> = { unix: 'macOS / Linux', windows: 'Windows' }

const LANG_LABELS: Record<string, string> = {
  bash: 'Terminal',
  sh: 'Terminal',
  shell: 'Terminal',
  console: 'Terminal',
  powershell: 'PowerShell',
  bat: 'cmd',
  yaml: 'YAML',
  yml: 'YAML',
  sql: 'SQL',
  json: 'JSON',
  text: 'Output',
  txt: 'Output',
}

// Replaces <pre> in MDX: adds a header with title/language and a copy button
export function CodeBlock(props: ComponentProps<'pre'> & { 'data-title'?: string; 'data-lang'?: string }) {
  const { 'data-title': title, 'data-lang': lang, className, children, ...rest } = props
  const ref = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)
  const { lang: uiLang } = useChapter()
  const ui = t(uiLang)
  const inTerminal = useInTerminal()
  const { os, setOs } = usePrefs()

  const copy = async () => {
    const text = ref.current?.innerText ?? ''
    try {
      await navigator.clipboard.writeText(text.replace(/\n$/, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard not available
    }
  }

  const label = title ?? (lang ? (LANG_LABELS[lang] ?? lang.toUpperCase()) : undefined)
  const isOutput = lang === 'text' || lang === 'txt'

  return (
    <div className={`not-prose group my-4 overflow-hidden rounded-xl border ${isOutput ? 'border-dashed border-slate-300 dark:border-slate-700' : 'border-slate-200 dark:border-slate-800'} bg-slate-50 dark:bg-slate-900`}>
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-1.5 dark:border-slate-800">
        {inTerminal ? (
          <div role="tablist" className="flex items-center gap-1">
            {(Object.keys(OS_LABELS) as Os[]).map((value) => (
              <button
                key={value}
                role="tab"
                type="button"
                aria-selected={os === value}
                onClick={() => setOs(value)}
                className={`rounded-md px-2 py-0.5 text-xs font-medium transition ${
                  os === value
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-white dark:ring-slate-700'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {OS_LABELS[value]}
              </button>
            ))}
            <span className="ml-1 font-mono text-[11px] text-slate-400">{os === 'windows' ? 'PowerShell' : 'Terminal'}</span>
          </div>
        ) : (
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{label}</span>
        )}
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label={ui.copy}
        >
          {copied ? <CheckIcon width={14} height={14} className="text-emerald-500" /> : <CopyIcon width={14} height={14} />}
          {copied ? ui.copied : ui.copy}
        </button>
      </div>
      <pre ref={ref} className={`${className ?? ''} overflow-x-auto px-4 py-3 font-mono text-[13px] leading-relaxed`} {...rest}>
        {children}
      </pre>
    </div>
  )
}
