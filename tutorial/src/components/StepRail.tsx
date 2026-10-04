import { useEffect, useState } from 'react'
import { t, type Lang } from '../i18n'
import { useProgress } from '../state/progress'
import { CheckIcon } from './icons'

// "On this page" list of the steps in the current chapter, read from the rendered step cards
export function StepRail({ lang, slug }: { lang: Lang; slug: string }) {
  const [steps, setSteps] = useState<{ id: string; title: string }[]>([])
  const { isDone } = useProgress()

  useEffect(() => {
    const read = () =>
      setSteps(
        Array.from(document.querySelectorAll<HTMLElement>('[data-step]')).map((el) => ({ id: el.dataset.step!, title: el.dataset.title! })),
      )
    read()
    // chapters load lazily: re-read once the content has rendered
    const main = document.querySelector('main')
    if (!main) return
    const observer = new MutationObserver(read)
    observer.observe(main, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [slug, lang])

  if (steps.length === 0) return null

  return (
    <div>
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t(lang).onThisPage}</div>
      <ol className="space-y-1 border-l border-slate-200 dark:border-slate-800">
        {steps.map((step, i) => {
          const done = isDone(slug, step.id)
          return (
            <li key={step.id}>
              <a
                href={`#step-${step.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(`step-${step.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className={`-ml-px flex items-start gap-2 border-l-2 py-1 pl-3 text-[13px] leading-snug transition ${
                  done
                    ? 'border-emerald-400 text-slate-400 dark:text-slate-500'
                    : 'border-transparent text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                <span className="w-4 shrink-0 tabular-nums">{done ? <CheckIcon width={13} height={13} className="mt-0.5 text-emerald-500" /> : `${i + 1}.`}</span>
                <span>{step.title}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
