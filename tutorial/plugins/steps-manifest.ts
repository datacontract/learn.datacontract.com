import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

// Provides `virtual:steps`: the <Step id="..."> ids of every chapter, per language.
// The sidebar needs them for progress, without loading the (lazy) chapter content.
export function stepsManifest(contentDir: string): Plugin {
  const id = 'virtual:steps'
  const resolved = '\0' + id
  return {
    name: 'steps-manifest',
    resolveId: (source) => (source === id ? resolved : undefined),
    load(source) {
      if (source !== resolved) return
      const manifest: Record<string, Record<string, string[]>> = {}
      for (const lang of readdirSync(contentDir)) {
        manifest[lang] = {}
        for (const file of readdirSync(join(contentDir, lang)).filter((f) => f.endsWith('.mdx'))) {
          const path = join(contentDir, lang, file)
          this.addWatchFile(path)
          const text = readFileSync(path, 'utf8')
          manifest[lang][file.replace(/\.mdx$/, '')] = [...text.matchAll(/<Step\s+id="([^"]+)"/g)].map((m) => m[1])
        }
      }
      return `export default ${JSON.stringify(manifest)}`
    },
    handleHotUpdate({ file, server }) {
      if (!file.startsWith(contentDir)) return
      const module = server.moduleGraph.getModuleById(resolved)
      if (module) server.moduleGraph.invalidateModule(module)
    },
  }
}
