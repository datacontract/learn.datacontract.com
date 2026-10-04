import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'

type JsxNode = { type: string; name?: string; attributes?: { type: string; name?: string; value?: unknown }[] }

// Fails the build for <Step> elements without a literal id or with a duplicate id:
// progress is stored by these ids, and the steps manifest reads them as plain text.
export function remarkCheckSteps() {
  return (tree: Root, file: { path?: string }) => {
    const ids = new Set<string>()
    visit(tree, (node) => {
      const jsx = node as JsxNode
      if (jsx.type !== 'mdxJsxFlowElement' || jsx.name !== 'Step') return
      const id = jsx.attributes?.find((a) => a.type === 'mdxJsxAttribute' && a.name === 'id')?.value
      if (typeof id !== 'string') throw new Error(`${file.path}: <Step> requires a literal id attribute`)
      if (ids.has(id)) throw new Error(`${file.path}: duplicate <Step id="${id}">`)
      ids.add(id)
    })
  }
}
