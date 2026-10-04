import { useState, type ReactNode } from 'react'
import { t } from '../i18n'
import { useChapter } from './ChapterContext'
import { KeyIcon } from './icons'

export function Solution({ title, children }: { title?: string; children: ReactNode }) {
  const { lang } = useChapter()
  const ui = t(lang)
  const [open, setOpen] = useState(false)

  return (
    <div className="my-5 rounded-xl border border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold text-amber-900 dark:text-amber-200"
      >
        <KeyIcon width={16} height={16} />
        <span className="flex-1">{open ? ui.hideSolution : ui.solution}{title ? ` · ${title}` : ''}</span>
      </button>
      {open && (
        <div className="border-t border-amber-200 px-4 pb-3 pt-2 dark:border-amber-900/50">
          <p className="text-xs text-amber-800/80 dark:text-amber-200/70">{ui.solutionHint}</p>
          <div className="prose prose-slate max-w-none dark:prose-invert">{children}</div>
        </div>
      )}
    </div>
  )
}
