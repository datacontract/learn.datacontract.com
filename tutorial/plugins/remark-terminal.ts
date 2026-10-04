import type { Root, Code, RootContent } from 'mdast'

const UNIX = new Set(['bash', 'sh', 'shell'])

type Parent = { children: RootContent[] }

// Every terminal command needs a macOS/Linux and a Windows variant. A ```bash block must be
// followed directly by a ```powershell block; both are wrapped in <Terminal>, which shows
// the one matching the selected OS. A missing Windows variant fails the build.
// Included reference files (file=...) are exempt.
export function remarkTerminal() {
  return (tree: Root, file: { path?: string }) => {
    const walk = (parent: Parent) => {
      for (let i = 0; i < parent.children.length; i++) {
        const node = parent.children[i] as Code & Parent
        const included = (node.data as { included?: boolean } | undefined)?.included
        if (node.type === 'code' && UNIX.has(node.lang ?? '') && !included) {
          const next = parent.children[i + 1] as Code | undefined
          if (next?.type !== 'code' || next.lang !== 'powershell') {
            const line = node.position?.start.line
            throw new Error(`${file.path}:${line}: \`\`\`${node.lang} block without a following \`\`\`powershell block`)
          }
          parent.children.splice(i, 2, {
            type: 'mdxJsxFlowElement',
            name: 'Terminal',
            attributes: [],
            children: [node, next],
          } as never)
        } else if (node.type === 'code' && node.lang === 'powershell') {
          throw new Error(`${file.path}:${node.position?.start.line}: \`\`\`powershell block without a preceding \`\`\`bash block`)
        } else if ('children' in node && Array.isArray(node.children)) {
          walk(node)
        }
      }
    }
    walk(tree as Parent)
  }
}
