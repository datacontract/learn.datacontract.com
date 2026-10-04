import { chapters, exerciseNumber, parts, stepsOf } from '../chapters'
import { t, type Lang } from '../i18n'
import { href } from '../router'
import { useProgress } from '../state/progress'
import { ProgressRing } from './ProgressRing'

export function Sidebar({ lang, current, onNavigate }: { lang: Lang; current: string; onNavigate?: () => void }) {
  const { doneSteps } = useProgress()
  const ui = t(lang)

  return (
    <nav className="space-y-6">
      {parts.map((part) => (
        <div key={part.id}>
          <div className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {part.title[lang]}
            {part.optional && <span className="rounded bg-slate-100 px-1.5 py-px text-[10px] normal-case tracking-normal dark:bg-slate-800">{ui.optional}</span>}
          </div>
          <ul className="space-y-0.5">
            {chapters
              .filter((c) => c.part === part.id)
              .map((chapter) => {
                const total = stepsOf(chapter.slug).length
                const done = doneSteps(chapter.slug).filter((s) => stepsOf(chapter.slug).includes(s)).length
                const active = chapter.slug === current
                const number = exerciseNumber(chapter.slug)
                return (
                  <li key={chapter.slug}>
                    <a
                      href={href(lang, chapter.slug)}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                        active
                          ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-200'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      <ProgressRing value={total ? done / total : 0} />
                      <span className="flex-1 leading-snug">
                        {number && <span className="mr-1 tabular-nums text-slate-400">{number}.</span>}
                        {chapter.title[lang]}
                      </span>
                      <span className="text-[11px] tabular-nums text-slate-400">{chapter.minutes}′</span>
                    </a>
                  </li>
                )
              })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
