// Umami custom events (the script is loaded in index.html). Only called from click handlers, never during render.
// Missing script (ad blocker, prerendering) or errors must never break the page.
import { load, save } from './storage'

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string | number>) => void }
  }
}

export function track(event: string, data?: Record<string, string | number>) {
  try {
    window.umami?.track(event, data)
  } catch {
    // ignore
  }
}

// Like track, but at most once per browser for the given key (undo + redo of a step must not count twice),
// so event counts approximate the number of participants who got there.
const SENT_KEY = 'tutorial-tracked-v1'

export function trackOnce(key: string, event: string, data?: Record<string, string | number>) {
  const sent = load<string[]>(SENT_KEY, [])
  if (sent.includes(key)) return
  save(SENT_KEY, [...sent, key])
  track(event, data)
}

export function currentLang() {
  return location.pathname.split('/')[1] === 'de' ? 'de' : 'en'
}
