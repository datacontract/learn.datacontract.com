import { prerender } from 'react-dom/static'
import { Root } from './Root'
import type { Route } from './router'

// renders one page to static HTML, waiting for the lazily loaded chapter content
export async function render(route: Route): Promise<string> {
  const { prelude } = await prerender(<Root route={route} />)
  return await new Response(prelude).text()
}

export { chapters, exerciseNumber, parts } from './chapters'
export { href } from './router'
export { t } from './i18n'
