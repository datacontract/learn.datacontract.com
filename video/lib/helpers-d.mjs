// Helpers for the Part D videos (publish, semantics): Entropy Data Community Edition on localhost:8081.
import { showCursor } from './browser.mjs'

export const CE = 'http://localhost:8081'

/** cloud URLs in the chapter outputs, shown as the local Community Edition the video uses */
export const local = (text) => text.replaceAll('https://app.entropy-data.com/tutorial-simon', `${CE}/acme`)

/** logs in before the visible part of a scene starts */
export async function login(page) {
  await page.goto(`${CE}/login`)
  await page.fill('input[name=username]', 'workshop@example.com')
  await page.fill('input[name=password]', 'workshop')
  await page.click('button[type=submit]')
  await page.waitForLoadState('networkidle')
}

/** waits for a page after a navigation and re-adds the pointer (navigation removes it) */
export async function settle(page, ms = 1200) {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(400)
  await showCursor(page)
  await page.waitForTimeout(ms)
}

/** scrolls the page smoothly by dy pixels */
export async function scroll(page, dy, { steps = 25, ms = 900 } = {}) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, dy / steps)
    await page.waitForTimeout(ms / steps)
  }
  await page.waitForTimeout(300)
}
