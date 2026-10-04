import type { ReactNode } from 'react'
import { t } from '../i18n'
import { useChapter } from './ChapterContext'

export function Goals({ children }: { children: ReactNode }) {
  const { lang } = useChapter()
  return (
    <div className="my-6 rounded-2xl bg-gradient-to-br from-brand-50 to-white p-5 ring-1 ring-brand-100 dark:from-brand-950/60 dark:to-slate-900 dark:ring-brand-900/60">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">{t(lang).goals}</div>
      <div className="prose prose-sm max-w-none dark:prose-invert prose-ul:my-0 prose-li:my-0.5 prose-li:marker:text-brand-400">{children}</div>
    </div>
  )
}
