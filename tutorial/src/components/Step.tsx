import { useState, type ReactNode } from 'react'
import { t } from '../i18n'
import { useProgress } from '../state/progress'
import { useChapter } from './ChapterContext'
import { CheckIcon, ChevronIcon } from './icons'

// A numbered, checkable step. Done steps collapse to one line, so the next open step is always in view.
export function Step({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const { slug, lang } = useChapter()
  const { isDone, toggle } = useProgress()
  const ui = t(lang)
  const done = isDone(slug, id)
  const [expanded, setExpanded] = useState(false)
  const open = !done || expanded

  const onToggleDone = () => {
    const willBeDone = !done
    toggle(slug, id)
    setExpanded(false)
    if (willBeDone) {
      // bring the next open step into view
      requestAnimationFrame(() => {
        const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-step]'))
        const next = cards.slice(cards.findIndex((c) => c.dataset.step === id) + 1).find((c) => c.dataset.done === 'false')
        next?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  return (
    <section
      id={`step-${id}`}
      data-step={id}
      data-done={String(done)}
      data-title={title}
      className={`step-card relative my-6 rounded-2xl border transition ${
        done
          ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20'
          : 'border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40'
      }`}
    >
      <header className="flex items-center gap-3 px-5 py-4">
        <button
          type="button"
          onClick={onToggleDone}
          aria-label={done ? ui.markUndone : ui.markDone}
          title={done ? ui.markUndone : ui.markDone}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition ${
            done
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'step-number border-brand-200 text-brand-600 hover:border-brand-500 dark:border-brand-900 dark:text-brand-300'
          }`}
        >
          {done && <CheckIcon width={16} height={16} />}
        </button>
        <div role="heading" aria-level={3} className={`flex-1 text-base font-semibold ${done ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
          {title}
        </div>
        {done && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={ui.showStep}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <ChevronIcon className={`transition ${expanded ? 'rotate-90' : ''}`} />
          </button>
        )}
      </header>
      {open && (
        <div className="px-5 pb-5 sm:pl-16">
          <div className="prose prose-slate max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-brand-600 dark:prose-a:text-brand-300">
            {children}
          </div>
          {!done && (
            <button
              type="button"
              onClick={onToggleDone}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <CheckIcon width={16} height={16} />
              {ui.stepDone}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
