import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { langs, type Lang } from './i18n'

export type Route = { lang: Lang; slug: string }

/** /en/ for the welcome page, /en/<slug>/ for all others */
export function href(lang: Lang, slug: string) {
  return slug === 'welcome' ? `/${lang}/` : `/${lang}/${slug}/`
}

export function parsePath(path: string): Route {
  const [, lang, slug] = path.split('/')
  return { lang: langs.includes(lang as Lang) ? (lang as Lang) : 'en', slug: slug || 'welcome' }
}

const RouteContext = createContext<Route>({ lang: 'en', slug: 'welcome' })

// Path-based routing. Every page is also prerendered as static HTML (scripts/prerender.mjs);
// in the browser, internal links are handled here without reloading the page.
export function RouterProvider({ initial, children }: { initial: Route; children: ReactNode }) {
  const [route, setRoute] = useState(initial)

  useEffect(() => {
    const onPop = () => setRoute(parsePath(location.pathname))
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element).closest('a')
      const url = a && !a.target && a.getAttribute('href')
      if (!url || !/^\/(en|de)\//.test(url)) return
      e.preventDefault()
      const [path, hash] = url.split('#')
      if (path !== location.pathname) {
        history.pushState(null, '', url)
        setRoute(parsePath(path))
      }
      requestAnimationFrame(() => {
        const target = hash && document.getElementById(hash)
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else window.scrollTo({ top: 0, behavior: 'instant' })
      })
    }
    addEventListener('popstate', onPop)
    document.addEventListener('click', onClick)
    return () => {
      removeEventListener('popstate', onPop)
      document.removeEventListener('click', onClick)
    }
  }, [])

  return <RouteContext.Provider value={route}>{children}</RouteContext.Provider>
}

export function useRoute() {
  return useContext(RouteContext)
}
