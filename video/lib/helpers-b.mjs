// Extra helpers for the scenes of evolution, data-product, and contract-first.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { click, moveTo, type } from './browser.mjs'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
export const repo = fileURLToPath(new URL('../../', import.meta.url))

/** an empty scratch folder for a scene */
export function freshDir(...parts) {
  const dir = join(tmpdir(), 'tutorial-videos', ...parts)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  return dir
}

/** writes a prepared copy of a repo file, optionally transformed */
export function prepare(dir, name, source, transform = (s) => s) {
  const path = join(dir, name)
  writeFileSync(path, transform(readFileSync(join(repo, source), 'utf8')))
  return path
}

/** picks a value in a headless UI combobox: types to filter, then clicks the option */
export async function combobox(page, locator, text, option = text) {
  await type(page, locator, text, { delay: 70 })
  const opt = page.getByRole('option', { name: option, exact: true })
  await opt.waitFor({ timeout: 5000 })
  await click(page, opt, { pause: 400 })
}

/** selects an option of a native <select> with a visible click first */
export async function choose(page, locator, label) {
  await click(page, locator, { pause: 250 })
  await locator.selectOption({ label })
  await page.keyboard.press('Escape').catch(() => {})
  await sleep(400)
}

/** clicks a navigation link in the editor sidebar */
export async function nav(page, name, exact = true) {
  await click(page, page.getByRole('link', { name, exact }), { pause: 700 })
}

/** saves in the editor */
export async function save(page) {
  await click(page, page.getByRole('button', { name: 'Save' }), { pause: 1000 })
}

/** runs the editor's Tests panel and waits for the result */
export async function runTests(page, { hold = 3500 } = {}) {
  await click(page, page.getByRole('button', { name: 'Tests' }), { pause: 700 })
  const run = page.getByRole('button', { name: 'Run Test' })
  await click(page, run)
  // the panel sometimes ignores the very first click while it slides in
  await sleep(1500)
  if (await page.getByText('No test results yet').isVisible().catch(() => false)) await run.click()
  try {
    await page.getByText(/^(Passed|Failed)$/).last().waitFor({ timeout: 90000 })
  } catch (e) {
    await page.screenshot({ path: '/tmp/tutorial-videos/runtests-failure.png' })
    throw e
  }
  await sleep(1200)
  // scroll through the results so viewers see the checks
  await page.mouse.move(1010, 480, { steps: 15 })
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 120); await sleep(350) }
  await sleep(hold)
}

/** switches to the YAML view and scrolls to the first line containing `text` */
export async function showYaml(page, text, { hold = 3500 } = {}) {
  await click(page, page.getByRole('button', { name: 'YAML' }), { pause: 1200 })
  await page.mouse.move(500, 400, { steps: 10 })
  for (let i = 0; i < 150; i++) {
    if (await page.locator('.view-line', { hasText: text }).first().isVisible().catch(() => false)) break
    await page.mouse.wheel(0, 260); await sleep(90)
  }
  // bring the line from the bottom edge towards the middle
  for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 260); await sleep(120) }
  await sleep(hold)
}

/**
 * A browser scene with the code editor look of player/code.html: types `parts` into `file`
 * (each part with its own caption), optionally starting from `initial` content.
 */
export function codeScene({ file, initial = '', parts, charMs = 20, endHold = 2500 }) {
  return {
    kind: 'browser',
    async run({ page, cue, sleep, start, player }) {
      await page.goto(player('code.html'))
      await page.waitForTimeout(800)
      await page.evaluate(([f, t]) => { window.setFile(f); window.setContent(t) }, [file, initial])
      start()
      for (const part of parts) {
        if (part.caption) cue(part.caption)
        if (part.before) await sleep(part.before)
        await page.evaluate(([t, ms]) => window.typeCode(t, { charMs: ms }), [part.text, part.charMs ?? charMs])
        await sleep(part.hold ?? 1800)
      }
      await page.evaluate(() => window.saved())
      await sleep(endHold)
    },
  }
}

export { click, moveTo, type, sleep }
