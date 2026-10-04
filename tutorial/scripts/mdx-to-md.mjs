// Converts a tutorial chapter (MDX with our components) into plain Markdown for
// llms.txt / llms-full.txt and the per-page .md files that AI systems can read.
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const SITE = 'https://learn.datacontract.com'

const indent = (text, prefix) => text.split('\n').map((l) => (l ? prefix + l : prefix.trimEnd())).join('\n')

// JSX attribute values like {["a", "b"]} or {"text"} are JSON in our content
function attr(source, name) {
  const m = source.match(new RegExp(`${name}=(?:"([^"]*)"|\\{([\\s\\S]*?)\\}(?=\\s+\\w+=|\\s*>))`))
  if (!m) return undefined
  if (m[1] !== undefined) return m[1]
  try { return JSON.parse(m[2]) } catch { return m[2] }
}

export function mdxToMarkdown(source, file) {
  let md = source

  // reference solutions included from files
  md = md.replace(/```(\w+) file=(\S+)\n```/g, (_, lang, path) => {
    const content = readFileSync(resolve(dirname(file), path), 'utf8').trimEnd()
    return `\`\`\`${lang} title=${path.split('/').pop()}\n${content}\n\`\`\``
  })

  // macOS/Linux and Windows variants of a command
  md = md.replace(/```bash\n([\s\S]*?)```\s*```powershell\n([\s\S]*?)```(?:\s*```output\n([\s\S]*?)```)?/g, (_, unix, win, out) =>
    `macOS / Linux:\n\n\`\`\`bash\n${unix}\`\`\`\n\nWindows (PowerShell):\n\n\`\`\`powershell\n${win}\`\`\`` + (out ? `\n\nOutput:\n\n\`\`\`text\n${out}\`\`\`` : ''))

  md = md.replace(/<Quiz([\s\S]*?)>([\s\S]*?)<\/Quiz>/g, (_, attrs, explanation) => {
    const question = attr(attrs, 'question')
    const options = attr(attrs, 'options') ?? []
    const answer = Number(attr(attrs, 'answer'))
    return `**Quick check:** ${question}\n\n${options.map((o, i) => `- ${o}${i === answer ? ' (correct)' : ''}`).join('\n')}\n\n${explanation.trim()}`
  })

  md = md.replace(/<Callout([^>]*)>([\s\S]*?)<\/Callout>/g, (_, attrs, body) => {
    const title = attr(attrs, 'title') ?? (attr(attrs, 'type') ?? 'note').replace(/^\w/, (c) => c.toUpperCase())
    return indent(`**${title}**\n\n${body.trim()}`, '> ')
  })
  md = md.replace(/<Step id="([^"]+)" title="([^"]+)">/g, '### $2')
  md = md.replace(/<Solution(?: title="([^"]*)")?>/g, (_, t) => `**Solution${t ? `: ${t}` : ''}**`)
  md = md.replace(/<Goals>/g, '**You will learn:**')
  md = md.replace(/<Os name="unix">/g, '**macOS / Linux:**').replace(/<Os name="windows">/g, '**Windows:**')
  md = md.replace(/<ScenarioDiagram[^>]*\/>/g, '_Scenario: the Orders data product (output ports orders_v1 and orders_v2) is consumed by the SKU Sales data product, which the purchasing team uses._')
  md = md.replace(/<\/?(Step|Solution|Goals|OsTabs|Os)>/g, '')

  // absolute URLs for links and images
  md = md.replace(/\]\((\/[^)]*)\)/g, `](${SITE}$1)`)
  md = md.replace(/\n{3,}/g, '\n\n')
  return md.trim() + '\n'
}
