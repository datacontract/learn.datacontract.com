import { useState, type ReactNode } from 'react'
import { t } from '../i18n'
import { useChapter } from './ChapterContext'

// feedback strings are plain text: render `backticks` as inline code
function inlineCode(text: string) {
  return text.split(/(`[^`]+`)/).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code key={i} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] dark:bg-slate-800">{part.slice(1, -1)}</code>
    ) : (
      part
    ),
  )
}

// A single-choice knowledge check. The explanation (children) is shown once the right answer
// is picked; `feedback` holds one explanation per option, shown when that wrong option is checked.
export function Quiz({ question, options, answer, feedback, children }: {
  question: string
  options: string[]
  answer: number
  feedback?: string[]
  children?: ReactNode
}) {
  const { lang } = useChapter()
  const ui = t(lang)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = checked && selected === answer

  return (
    <div className="my-6 rounded-2xl border border-violet-200 bg-violet-50/50 p-5 dark:border-violet-900/50 dark:bg-violet-950/20">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">{ui.quiz}</div>
      <div className="mb-3 font-medium text-slate-900 dark:text-white">{question}</div>
      <div className="space-y-2">
        {options.map((option, i) => {
          const state = checked && selected === i ? (i === answer ? 'right' : 'wrong') : selected === i ? 'selected' : 'idle'
          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                setSelected(i)
                setChecked(false)
              }}
              className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                {
                  idle: 'border-slate-200 bg-white hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-violet-700',
                  selected: 'border-violet-400 bg-white ring-2 ring-violet-200 dark:border-violet-600 dark:bg-slate-900 dark:ring-violet-900',
                  right: 'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/40',
                  wrong: 'border-rose-300 bg-rose-50 dark:border-rose-700 dark:bg-rose-950/40',
                }[state]
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={selected === null}
          onClick={() => setChecked(true)}
          className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-40"
        >
          {ui.quizCheck}
        </button>
        {checked && (
          <span className={`text-sm font-medium ${correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {correct ? ui.quizCorrect : ui.quizWrong}
          </span>
        )}
      </div>
      {checked && !correct && selected !== null && feedback?.[selected] && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-rose-900/60 dark:bg-slate-900 dark:text-slate-300">
          {inlineCode(feedback[selected])}
        </div>
      )}
      {correct && children && <div className="prose prose-sm mt-3 max-w-none dark:prose-invert">{children}</div>}
    </div>
  )
}
