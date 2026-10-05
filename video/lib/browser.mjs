// Helpers for browser scenes: a visible mouse pointer, human-like clicking and typing,
// and starting the Data Contract Editor (`datacontract edit`) on a prepared contract file.
import { spawn } from 'node:child_process'
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Playwright videos have no mouse pointer: draw one that follows the mouse */
export async function showCursor(page) {
  await page.addStyleTag({ content: `
    #__cursor { position: fixed; z-index: 2147483647; width: 22px; height: 22px; pointer-events: none; left: -50px; top: -50px;
      transition: transform .08s; filter: drop-shadow(0 2px 3px rgba(0,0,0,.35)); }
    #__cursor.down { transform: scale(.85); }
    .__ripple { position: fixed; z-index: 2147483646; width: 34px; height: 34px; margin: -17px 0 0 -17px; border-radius: 50%;
      background: rgba(99,102,241,.35); pointer-events: none; animation: __rip .5s ease-out forwards; }
    @keyframes __rip { from { transform: scale(.3); opacity: 1 } to { transform: scale(1.6); opacity: 0 } }` })
  await page.evaluate(() => {
    const c = document.createElement('div')
    c.id = '__cursor'
    c.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 2l16 9-7 2-3 7z" fill="#111" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>'
    document.body.appendChild(c)
    addEventListener('mousemove', (e) => { c.style.left = e.clientX - 3 + 'px'; c.style.top = e.clientY - 2 + 'px' }, true)
    addEventListener('mousedown', (e) => {
      c.classList.add('down')
      const r = document.createElement('div'); r.className = '__ripple'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'
      document.body.appendChild(r); setTimeout(() => r.remove(), 600)
    }, true)
    addEventListener('mouseup', () => c.classList.remove('down'), true)
  })
}

let mouse = { x: 640, y: 360 }

/** moves the pointer smoothly to the center of a locator */
export async function moveTo(page, locator) {
  await locator.scrollIntoViewIfNeeded()
  const box = await locator.boundingBox()
  if (!box) throw new Error('element not visible')
  const target = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  const steps = Math.max(12, Math.round(Math.hypot(target.x - mouse.x, target.y - mouse.y) / 18))
  await page.mouse.move(target.x, target.y, { steps })
  mouse = target
}

export async function click(page, locator, { pause = 350 } = {}) {
  await moveTo(page, locator)
  await sleep(180)
  await page.mouse.down(); await sleep(70); await page.mouse.up()
  await sleep(pause)
}

/** clicks into a field, clears it, and types like a human */
export async function type(page, locator, text, { delay = 55, clear = true } = {}) {
  await click(page, locator, { pause: 150 })
  if (clear) { await locator.fill('') }
  await locator.pressSequentially(text, { delay })
  await sleep(300)
}

/**
 * Starts `datacontract edit` (pinned CLI) on a copy of `contractFile` (or an empty new file)
 * in a scratch folder. Returns { url, file, stop }.
 */
export async function startEditor({ workdir, file = 'orders_v1.odcs.yaml', from, port = 4321 }) {
  mkdirSync(workdir, { recursive: true })
  const path = join(workdir, file)
  if (from) copyFileSync(from, path)
  const child = spawn('sh', ['-c', `yes | uvx --quiet --python 3.11 --from 'datacontract-cli[all]==1.2.3' datacontract edit ${file} --no-open --port ${port}`],
    { cwd: workdir, env: { ...process.env, DATACONTRACT_POSTGRES_USERNAME: 'workshop', DATACONTRACT_POSTGRES_PASSWORD: 'workshop' }, stdio: 'ignore', detached: true })
  const url = `http://localhost:${port}`
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(url)).ok) break } catch { /* not up yet */ }
    await sleep(500)
  }
  return { url, file: path, stop: () => { try { process.kill(-child.pid) } catch { /* already gone */ } } }
}

export function writeFile(path, text) { writeFileSync(path, text) }
