import { useEffect, useState } from 'react'
import { detectLang, langs, type Lang } from './i18n'

export type Route = { lang: Lang; slug: string }

function parse(hash: string): Route {
  const [, lang, slug] = hash.replace(/^#/, '').split('/')
  const validLang = langs.includes(lang as Lang) ? (lang as Lang) : detectLang()
  return { lang: validLang, slug: slug || 'welcome' }
}

export function href(lang: Lang, slug: string) {
  return `#/${lang}/${slug}`
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(location.hash.startsWith('#/') ? location.hash : ''))
  useEffect(() => {
    const onChange = () => {
      // plain in-page anchors (e.g. #step-test) are not routes: scroll to them and keep the page
      if (location.hash && !location.hash.startsWith('#/')) {
        document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      setRoute(parse(location.hash))
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
