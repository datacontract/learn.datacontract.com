import { useState } from 'react'
import { t, type Lang } from '../i18n'

// Collapsible walkthrough video of a chapter: silent, with captions in the current language
export function Walkthrough({ slug, lang }: { slug: string; lang: Lang }) {
  const ui = t(lang)
  const [open, setOpen] = useState(false)
  const base = `/videos/${slug}`

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group mt-6 flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-brand-800"
      >
        <span className="relative block w-40 shrink-0 overflow-hidden rounded-lg">
          <img src={`${base}.webp`} alt="" className="block w-full" />
          <span className="absolute inset-0 flex items-center justify-center bg-slate-900/20 transition group-hover:bg-slate-900/10">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow">
              <svg width="16" height="16" viewBox="0 0 24 24" className="ml-0.5 text-brand-600" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </span>
        </span>
        <span>
          <span className="block font-semibold text-slate-900 dark:text-white">{ui.watchVideo}</span>
          <span className="block text-sm text-slate-500">{ui.videoHint}</span>
        </span>
      </button>
    )
  }

  return (
    <video
      key={lang}
      controls
      autoPlay
      playsInline
      poster={`${base}.webp`}
      className="mt-6 w-full rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800"
    >
      <source src={`${base}.mp4`} type="video/mp4" />
      <track kind="captions" src={`${base}.en.vtt`} srcLang="en" label="English" default={lang === 'en'} />
      <track kind="captions" src={`${base}.de.vtt`} srcLang="de" label="Deutsch" default={lang === 'de'} />
    </video>
  )
}
