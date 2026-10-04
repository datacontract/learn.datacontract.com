import { createContext, useContext } from 'react'
import type { Lang } from '../i18n'

export const ChapterContext = createContext<{ slug: string; lang: Lang }>({ slug: '', lang: 'en' })

export function useChapter() {
  return useContext(ChapterContext)
}
