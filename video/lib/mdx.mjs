// Reads the terminal commands and their example outputs from a tutorial chapter,
// so the videos show exactly what the chapter shows.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const content = join(dirname(fileURLToPath(import.meta.url)), '../../tutorial/src/content')

/** [{ step, cmd, out }] in chapter order (macOS/Linux variant) */
export function commands(slug, lang = 'en') {
  const text = readFileSync(join(content, lang, `${slug}.mdx`), 'utf8')
  const result = []
  let step = null
  const re = /<Step id="([^"]+)"|```bash[^\n]*\n([\s\S]*?)```\s*```powershell[^\n]*\n[\s\S]*?```(?:\s*```output\n([\s\S]*?)```)?/g
  for (const m of text.matchAll(re)) {
    if (m[1]) step = m[1]
    else result.push({ step, cmd: m[2].trimEnd(), out: (m[3] ?? '').trimEnd() })
  }
  return result
}

/** the first command of a step whose text contains `includes` */
export function command(slug, step, includes = '') {
  const found = commands(slug).find((c) => c.step === step && c.cmd.includes(includes))
  if (!found) throw new Error(`no command in ${slug}#${step} containing "${includes}"`)
  return found
}
