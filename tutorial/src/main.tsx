import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import { detectLang } from './i18n'
import { href, parsePath } from './router'
import { Root } from './Root'

// old links used hash routing (#/de/contract)
if (location.hash.startsWith('#/')) {
  const [, lang, slug] = location.hash.split('/')
  location.replace(href(lang === 'de' ? 'de' : 'en', slug || 'welcome'))
} else if (location.pathname === '/') {
  // the root page is the English welcome page for crawlers; visitors go to their language
  location.replace(href(detectLang(), 'welcome'))
} else {
  const container = document.getElementById('root')!
  const root = <Root route={parsePath(location.pathname)} />
  if (container.hasChildNodes()) hydrateRoot(container, root)
  else createRoot(container).render(root)
}
