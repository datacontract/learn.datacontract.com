import { Suspense, useEffect, useRef, useState } from 'react'
import { chapters, content, exerciseNumber, parts, REPO_URL, stepsOf } from './chapters'
import { ChapterContext } from './components/ChapterContext'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, ClockIcon, GitHubIcon, MenuIcon, MoonIcon, SunIcon, XIcon } from './components/icons'
import { mdxComponents } from './components/mdx'
import { Sidebar } from './components/Sidebar'
import { StepRail } from './components/StepRail'
import { Walkthrough } from './components/Walkthrough'
import { langs, t, type Lang } from './i18n'
import { href, useRoute } from './router'
import { usePrefs } from './state/prefs'
import { useProgress } from './state/progress'

export function App() {
  const { lang, slug } = useRoute()
  const [menuOpen, setMenuOpen] = useState(false)
  const ui = t(lang)
  const firstRoute = useRef(true)

  useEffect(() => {
    document.documentElement.lang = lang
    const chapter = chapters.find((c) => c.slug === slug)
    document.title = chapter ? `${chapter.title[lang]} · ${ui.title}` : ui.title
    // the Umami script tracks the initial page view; chapter changes are hash changes, track them here
    if (firstRoute.current) firstRoute.current = false
    else (window as { umami?: { track: () => void } }).umami?.track()
  }, [lang, slug, ui.title])

  return (
    <ChapterContext.Provider value={{ slug, lang }}>
      <Header lang={lang} slug={slug} onMenu={() => setMenuOpen(true)} />
      <div className="mx-auto flex max-w-[90rem]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 overflow-y-auto border-r border-slate-200 px-4 py-8 lg:block dark:border-slate-800">
          <Sidebar lang={lang} current={slug} />
          <ResetProgress lang={lang} />
        </aside>
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12">
          <ChapterPage key={`${lang}/${slug}`} lang={lang} slug={slug} />
        </main>
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto py-8 pr-6 xl:block">
          <StepRail key={`${lang}/${slug}`} lang={lang} slug={slug} />
        </aside>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-white px-4 py-6 shadow-xl dark:bg-slate-950">
            <div className="mb-6 flex items-center justify-between px-3">
              <span className="text-sm font-semibold">{ui.menu}</span>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label={ui.close} className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                <XIcon />
              </button>
            </div>
            <Sidebar lang={lang} current={slug} onNavigate={() => setMenuOpen(false)} />
            <ResetProgress lang={lang} />
          </div>
        </div>
      )}
    </ChapterContext.Provider>
  )
}

function Header({ lang, slug, onMenu }: { lang: Lang; slug: string; onMenu: () => void }) {
  const ui = t(lang)
  const { theme, setTheme } = usePrefs()
  const { doneSteps } = useProgress()
  const total = chapters.reduce((sum, c) => sum + stepsOf(c.slug).length, 0)
  const done = chapters.reduce((sum, c) => sum + doneSteps(c.slug).filter((s) => stepsOf(c.slug).includes(s)).length, 0)
  const percent = total ? Math.round((done / total) * 100) : 0

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex h-full max-w-[90rem] items-center gap-3 px-4 sm:px-6">
        <button type="button" onClick={onMenu} className="rounded-md p-1.5 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800" aria-label={ui.menu}>
          <MenuIcon />
        </button>
        <a href={href(lang, 'welcome')} className="flex min-w-0 items-center gap-2.5">
          <img src="./favicon.png" alt="" className="h-8 w-8 dark:rounded-md dark:bg-white dark:p-0.5" />
          <span className="truncate text-sm font-bold text-slate-900 sm:text-base dark:text-white">{ui.title}</span>
        </a>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-2 md:flex" title={`${ui.progress}: ${done}/${total}`}>
            <span className="text-xs font-medium text-slate-500">{ui.progress}</span>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all" style={{ width: `${percent}%` }} />
            </div>
            <span className="w-9 text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-300">{percent}%</span>
          </div>
          <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
            {langs.map((l) => (
              <a
                key={l}
                href={href(l, slug)}
                className={`rounded-md px-2 py-1 text-xs font-semibold uppercase transition ${
                  l === lang ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {l}
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label={theme === 'dark' ? ui.themeLight : ui.themeDark}
            title={theme === 'dark' ? ui.themeLight : ui.themeDark}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="hidden rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 sm:block dark:hover:bg-slate-800 dark:hover:text-white" aria-label={ui.sourceOnGitHub} title={ui.sourceOnGitHub}>
            <GitHubIcon />
          </a>
        </div>
      </div>
    </header>
  )
}

function ChapterPage({ lang, slug }: { lang: Lang; slug: string }) {
  const ui = t(lang)
  const { doneSteps, setChapter } = useProgress()
  const index = chapters.findIndex((c) => c.slug === slug)
  const chapter = chapters[index]
  const Content = content(lang, slug)

  if (!chapter || !Content) {
    return (
      <div className="py-24 text-center">
        <p className="mb-4 text-slate-500">{ui.notFound}</p>
        <a className="font-semibold text-brand-600" href={href(lang, 'welcome')}>{ui.backHome}</a>
      </div>
    )
  }

  const part = parts.find((p) => p.id === chapter.part)!
  const number = exerciseNumber(slug)
  const steps = stepsOf(slug)
  const done = doneSteps(slug).filter((s) => steps.includes(s)).length
  const prev = chapters[index - 1]
  const next = chapters[index + 1]

  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
        <span>{part.title[lang]}</span>
        {part.optional && <span className="rounded bg-slate-100 px-1.5 py-px normal-case tracking-normal text-slate-500 dark:bg-slate-800">{ui.optional}</span>}
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        {number && <span className="text-slate-300 dark:text-slate-600">{ui.exercise} {number} · </span>}
        {chapter.title[lang]}
      </h1>
      <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">{chapter.summary[lang]}</p>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1.5"><ClockIcon width={15} height={15} /> ~{chapter.minutes} {ui.minutes}</span>
        {steps.length > 0 && <span>{ui.stepsDone(done, steps.length)}</span>}
      </div>

      {chapter.video && <Walkthrough key={slug} slug={slug} lang={lang} />}

      <div className="steps-root prose prose-slate mt-8 max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-h2:mt-12 prose-h2:text-2xl prose-a:text-brand-600 prose-a:underline-offset-2 dark:prose-a:text-brand-300">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />}>
          <Content components={mdxComponents} />
        </Suspense>
      </div>

      {steps.length > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setChapter(slug, done === steps.length ? [] : steps)}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
              done === steps.length
                ? 'border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900'
                : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
            }`}
          >
            <CheckIcon width={16} height={16} />
            {done === steps.length ? ui.markChapterUndone : ui.markChapterDone}
          </button>
        </div>
      )}

      {steps.length > 0 && done === steps.length && (
        <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          🎉 {ui.chapterComplete}
        </div>
      )}

      <nav className="mt-12 grid gap-4 border-t border-slate-200 pt-8 sm:grid-cols-2 dark:border-slate-800">
        {prev ? (
          <a href={href(lang, prev.slug)} className="group rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 hover:shadow-sm dark:border-slate-800 dark:hover:border-brand-800">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><ArrowLeftIcon width={14} height={14} /> {ui.previous}</div>
            <div className="mt-1 font-semibold text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">{prev.title[lang]}</div>
          </a>
        ) : <span />}
        {next && (
          <a href={href(lang, next.slug)} className="group rounded-xl border border-slate-200 p-4 text-right transition hover:border-brand-300 hover:shadow-sm dark:border-slate-800 dark:hover:border-brand-800">
            <div className="flex items-center justify-end gap-1.5 text-xs font-medium text-slate-500">{ui.next} <ArrowRightIcon width={14} height={14} /></div>
            <div className="mt-1 font-semibold text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-300">{next.title[lang]}</div>
          </a>
        )}
      </nav>

      <footer className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800">
        {ui.createdBy}{' '}
        <a href="https://www.linkedin.com/in/simonharrer/" target="_blank" rel="noreferrer" className="font-medium text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-300">Simon Harrer</a>
        {' · '}
        <a href="https://www.entropy-data.com" target="_blank" rel="noreferrer" className="hover:text-brand-600 dark:hover:text-brand-300">Entropy Data</a>
        {' · '}
        {ui.tscMember}{' '}
        <a href="https://bitol.io" target="_blank" rel="noreferrer" className="hover:text-brand-600 dark:hover:text-brand-300">Bitol</a>
        <a
          href="https://www.entropy-data.com"
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex w-fit items-center gap-2.5 rounded-lg py-1 text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
        >
          <span className="text-xs uppercase tracking-wider">{ui.maintainedBy}</span>
          <img src="./entropy-data-logo.svg" alt="" className="h-6 w-6" />
          <span className="font-semibold text-slate-800 dark:text-slate-100">Entropy Data</span>
        </a>
      </footer>
    </article>
  )
}

function ResetProgress({ lang }: { lang: Lang }) {
  const ui = t(lang)
  const { reset } = useProgress()
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), 3000)
    return () => clearTimeout(timer)
  }, [armed])
  return (
    <button
      type="button"
      onClick={() => (armed ? (reset(), setArmed(false)) : setArmed(true))}
      className={`mt-8 px-3 text-xs ${armed ? 'font-semibold text-rose-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
    >
      {armed ? ui.resetConfirm : ui.resetProgress}
    </button>
  )
}
