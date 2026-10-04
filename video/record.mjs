// Records the walkthrough video of a tutorial chapter.
//
//   node record.mjs <slug>
//
// Reads scenes/<slug>.mjs, records every scene with Playwright (1280x720), cuts and joins
// them with ffmpeg, and writes tutorial/public/videos/<slug>.mp4 plus English and German
// WebVTT captions (<slug>.en.vtt, <slug>.de.vtt) built from the cues of the scenes.
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

const here = dirname(fileURLToPath(import.meta.url))
const slug = process.argv[2]
if (!slug) throw new Error('usage: node record.mjs <slug>')

const { default: chapter } = await import(pathToFileURL(join(here, 'scenes', `${slug}.mjs`)))
const work = join(here, 'out', slug)
const target = resolve(here, '../tutorial/public/videos')
rmSync(work, { recursive: true, force: true })
mkdirSync(work, { recursive: true })
mkdirSync(target, { recursive: true })

const SIZE = { width: 1280, height: 720 }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const player = (name) => pathToFileURL(join(here, 'player', name)).href

const browser = await chromium.launch()
const clips = []
const cues = []
let offset = 0

for (const [index, scene] of chapter.scenes.entries()) {
  const dir = join(work, `scene-${index}`)
  const context = await browser.newContext({ viewport: SIZE, deviceScaleFactor: 1, recordVideo: { dir, size: SIZE } })
  const t0 = Date.now()
  const page = await context.newPage()
  const sceneCues = []
  let start = 0
  // a caption is shown from cue() until the next cue() or the end of the scene
  const cue = (text) => sceneCues.push({ at: Date.now() - start, text })
  const api = { page, cue, sleep, player, here }

  if (scene.kind === 'card') {
    const q = new URLSearchParams({ eyebrow: scene.eyebrow ?? '', title: scene.title, subtitle: scene.subtitle ?? '' })
    await page.goto(`${player('card.html')}?${q}`)
    await page.waitForTimeout(800)
    start = Date.now()
    if (scene.caption) cue(scene.caption)
    await sleep(scene.duration ?? 3500)
  } else if (scene.kind === 'terminal') {
    await page.goto(player('terminal.html'))
    await page.waitForTimeout(800)
    if (scene.prompt) await page.evaluate((p) => (window.PROMPT = p), scene.prompt)
    start = Date.now()
    for (const step of scene.steps) {
      if (step.caption) cue(step.caption)
      if (step.before) await sleep(step.before)
      await page.evaluate(([cmd, out]) => window.runCommand(cmd, out), [step.cmd, step.out ?? ''])
      await sleep(step.hold ?? 2500)
    }
    await page.evaluate(() => window.idle())
    await sleep(scene.tail ?? 800)
  } else if (scene.kind === 'image') {
    await page.setContent(`<html><body style="margin:0;width:1280px;height:720px;overflow:hidden;background:#f1f5f9">
      <img id="i" src="${pathToFileURL(resolve(here, scene.src)).href}" style="position:absolute;left:50%;top:40px;transform:translateX(-50%);max-width:1180px;border-radius:12px;box-shadow:0 20px 50px -20px rgba(15,23,42,.35);transition:transform ${(scene.duration ?? 5000) / 1000}s ease-in-out"></body></html>`)
    await page.waitForTimeout(800)
    start = Date.now()
    if (scene.caption) cue(scene.caption)
    // slow pan downwards for tall images
    await page.evaluate(() => {
      const img = document.getElementById('i')
      const overflow = img.getBoundingClientRect().height - 640
      if (overflow > 0) requestAnimationFrame(() => (img.style.transform = `translate(-50%, -${overflow}px)`))
    })
    await sleep(scene.duration ?? 5000)
  } else if (scene.kind === 'browser') {
    // custom scene: prepares itself, calls api.start() when the visible part begins
    api.start = () => { start = Date.now() }
    await scene.run(api)
    if (!start) throw new Error(`scene ${index}: browser scenes must call start()`)
  } else {
    throw new Error(`unknown scene kind ${scene.kind}`)
  }

  const end = Date.now()
  await context.close()
  const raw = join(dir, readdirSync(dir).find((f) => f.endsWith('.webm')))
  const clip = join(work, `clip-${String(index).padStart(2, '0')}.mp4`)
  const duration = (end - start) / 1000
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String((start - t0) / 1000), '-i', raw, '-t', String(duration),
    '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-an', clip])
  clips.push(clip)
  sceneCues.forEach((c, i) => cues.push({ start: offset + c.at / 1000, end: offset + (sceneCues[i + 1]?.at ?? end - start) / 1000, text: c.text }))
  offset += duration
  console.log(`scene ${index} (${scene.kind}): ${duration.toFixed(1)}s`)
}
await browser.close()

const list = join(work, 'clips.txt')
writeFileSync(list, clips.map((c) => `file '${c}'`).join('\n'))
const output = join(target, `${slug}.mp4`)
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-tune', 'stillimage', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output])

// poster frame for the player, taken from the title card
const poster = join(work, 'poster.png')
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '1.5', '-i', output, '-frames:v', '1', poster])
execFileSync('cwebp', ['-quiet', '-q', '80', poster, '-o', join(target, `${slug}.webp`)])

const ts = (s) => new Date(Math.max(0, s) * 1000).toISOString().slice(11, 23)
for (const lang of ['en', 'de']) {
  const vtt = ['WEBVTT', '', ...cues.filter((c) => c.text?.[lang]).flatMap((c, i) => [String(i + 1), `${ts(c.start)} --> ${ts(c.end - 0.05)}`, c.text[lang], ''])]
  writeFileSync(join(target, `${slug}.${lang}.vtt`), vtt.join('\n'))
}
// durations for the VideoObject structured data (tutorial/scripts/prerender.mjs)
const indexFile = join(target, 'videos.json')
let index = {}
try { index = JSON.parse(readFileSync(indexFile, 'utf8')) } catch { /* first video */ }
index[slug] = { duration: Math.round(offset * 10) / 10 }
writeFileSync(indexFile, JSON.stringify(Object.fromEntries(Object.entries(index).sort()), null, 2))
console.log(`wrote ${output} (${offset.toFixed(1)}s, ${cues.length} cues)`)
