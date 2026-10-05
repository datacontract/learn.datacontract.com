import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { visit } from 'unist-util-visit'
import type { Root, Code } from 'mdast'

// Replaces the body of a fenced code block with the contents of a file, so that
// reference solutions are rendered from .solutions/ instead of being duplicated:
//
//   ```yaml file=../../../../.solutions/exercise1/orders_v1.odcs.yaml
//   ```
//
// The path is resolved relative to the MDX file.
export function remarkIncludeFile() {
  return (tree: Root, file: { path?: string }) => {
    visit(tree, 'code', (node: Code) => {
      const match = node.meta?.match(/(?:^|\s)file=(\S+)/)
      if (!match || !file.path) return
      const path = resolve(dirname(file.path), match[1])
      node.value = readFileSync(path, 'utf8').trimEnd()
      // reference files are shown, not run: remark-terminal skips them
      node.data = { ...node.data, included: true } as Code['data']
      // keep the file name as title for the code block
      const title = match[1].split('/').pop()
      node.meta = node.meta!.replace(match[0], ` title=${title}`)
    })
  }
}
