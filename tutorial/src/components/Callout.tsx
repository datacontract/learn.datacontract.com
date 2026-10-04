import type { ReactNode } from 'react'
import { t } from '../i18n'
import { useChapter } from './ChapterContext'
import { AlertIcon, BookIcon, InfoIcon, LightbulbIcon } from './icons'

type Kind = 'note' | 'tip' | 'warning' | 'concept'

const STYLES: Record<Kind, { box: string; icon: typeof InfoIcon }> = {
  note: { box: 'border-sky-200 bg-sky-50/70 text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-100', icon: InfoIcon },
  tip: { box: 'border-emerald-200 bg-emerald-50/70 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100', icon: LightbulbIcon },
  warning: { box: 'border-rose-200 bg-rose-50/70 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-100', icon: AlertIcon },
  concept: { box: 'border-brand-200 bg-brand-50/70 text-brand-950 dark:border-brand-900/60 dark:bg-brand-950/40 dark:text-brand-50', icon: BookIcon },
}

export function Callout({ type = 'note', title, children }: { type?: Kind; title?: string; children: ReactNode }) {
  const { lang } = useChapter()
  const { box, icon: Icon } = STYLES[type]
  return (
    <aside className={`my-5 rounded-xl border px-4 py-3 ${box}`}>
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
        <Icon width={16} height={16} />
        {title ?? t(lang)[type]}
      </div>
      <div className="prose prose-sm max-w-none text-inherit dark:prose-invert prose-p:my-1.5 prose-p:text-inherit prose-li:text-inherit prose-strong:text-inherit">
        {children}
      </div>
    </aside>
  )
}
