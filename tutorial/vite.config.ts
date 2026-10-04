import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import rehypeShiki from '@shikijs/rehype'
import { remarkIncludeFile } from './plugins/remark-include-file.ts'
import { remarkCheckSteps } from './plugins/remark-check-steps.ts'
import { remarkTerminal } from './plugins/remark-terminal.ts'
import { stepsManifest } from './plugins/steps-manifest.ts'
import { promptLines } from './plugins/prompt-lines.ts'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  base: './',
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkGfm, remarkIncludeFile, remarkCheckSteps, remarkTerminal],
        rehypePlugins: [
          [
            rehypeShiki,
            {
              themes: { light: 'github-light', dark: 'github-dark' },
              defaultColor: false,
              addLanguageClass: true,
              transformers: [
                (() => {
                  // terminal commands: mark the lines that start a command, the Terminal component shows a prompt there
                  let prompts = new Set<number>()
                  return {
                    preprocess(this: unknown, code: string) {
                      const lang = (this as { options: { lang?: string } }).options.lang ?? ''
                      prompts = ['bash', 'sh', 'shell', 'powershell'].includes(lang) ? promptLines(code, lang) : new Set()
                    },
                    line(node: { properties: Record<string, unknown> }, line: number) {
                      if (prompts.has(line)) node.properties['data-prompt'] = ''
                      // staggers the line-by-line reveal of terminal output
                      node.properties.style = `--line-index: ${line}`
                    },
                  }
                })(),
                {
                  // expose `title=...` and the language on <pre>, the CodeBlock component renders them
                  pre(this: unknown, node: { properties: Record<string, unknown> }) {
                    const raw = (this as { options: { meta?: { __raw?: string }; lang?: string } }).options
                    const title = raw.meta?.__raw?.match(/title=(\S+)/)?.[1]
                    if (title) node.properties['data-title'] = title
                    if (raw.lang) node.properties['data-lang'] = raw.lang
                    if (/(^|\s)output(\s|$)/.test(raw.meta?.__raw ?? '')) node.properties['data-output'] = ''
                  },
                },
              ],
            },
          ],
        ],
      }),
    },
    react({ include: /\.(mdx|tsx|ts)$/ }),
    tailwindcss(),
    stepsManifest(fileURLToPath(new URL('./src/content', import.meta.url))),
  ],
})
