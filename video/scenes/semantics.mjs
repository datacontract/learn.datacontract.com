// Walkthrough of the "Semantics" chapter, recorded against the local Community Edition
// (http://localhost:8081, organization acme) with the ontology uploaded and the contracts linked.
import { readFileSync } from 'node:fs'
import { commands } from '../lib/mdx.mjs'
import { click, moveTo } from '../lib/browser.mjs'
import { CE, local, login, scroll, settle } from '../lib/helpers-d.mjs'

const all = commands('semantics')
const cmd = (step, includes = '') => {
  const found = all.find((c) => c.step === step && c.cmd.includes(includes))
  if (!found) throw new Error(`no command ${step} ${includes}`)
  return { cmd: found.cmd, out: local(found.out) }
}

const ontology = readFileSync(new URL('../../solutions/exercise8/semantics.yaml', import.meta.url), 'utf8').trimEnd()
const [head, rest] = [ontology.split('\n').slice(0, 13).join('\n'), ontology.split('\n').slice(13).join('\n')]

const link = `schema:
  - name: orders
    authoritativeDefinitions:
      - type: semantics
        url: https://learn.datacontract.com/ontology/ecommerce#Order
    properties:
      - name: order_id
        authoritativeDefinitions:
          - type: semantics
            url: https://learn.datacontract.com/ontology/ecommerce#orderId`

// a code window that types a file
const code = (file, typed, pasted, cues) => ({
  kind: 'browser',
  async run({ page, cue, sleep, start, player }) {
    await page.goto(player('code-d.html'))
    await page.waitForTimeout(800)
    await page.evaluate((f) => window.setFile(f), file)
    start()
    cue(cues[0])
    await sleep(600)
    await page.evaluate((t) => window.typeText(t, 30), typed)
    if (pasted) {
      if (cues[1]) cue(cues[1])
      await page.evaluate((t) => window.addLines('\n' + t, 110), pasted)
    }
    await sleep(4000)
  },
})

const explore = {
  kind: 'browser',
  async run({ page, cue, sleep, start }) {
    await login(page)
    await page.goto(`${CE}/acme/semantics`)
    await settle(page, 300)
    start()
    cue({ en: 'Open Semantics. Your namespace E-Commerce is there.', de: 'Öffne Semantics. Dein Namespace E-Commerce ist da.' })
    await sleep(2000)
    await click(page, page.getByRole('link', { name: 'E-Commerce' }).last())
    await settle(page)
    cue({ en: 'The two entities, Order and Article. Switch to the diagram.', de: 'Die beiden Entitäten Order und Article. Wechsle zum Diagramm.' })
    await sleep(2500)
    await click(page, page.getByRole('button', { name: 'Diagram' }).or(page.getByRole('link', { name: 'Diagram' })).first(), { pause: 3500 })
    cue({ en: 'Open Article, then its property SKU.', de: 'Öffne Article und dann seine Property SKU.' })
    await click(page, page.getByRole('button', { name: 'List' }).or(page.getByRole('link', { name: 'List' })).first(), { pause: 800 })
    await click(page, page.getByRole('link', { name: 'Article' }).last())
    await settle(page)
    await sleep(2500)
    const sku = page.getByRole('link', { name: 'SKU', exact: true }).first()
    if (await sku.count()) await click(page, sku)
    else await page.goto(`${CE}/acme/semantics/ecommerce/sku`)
    await settle(page)
    cue({ en: 'SKU: defined once, with its own IRI.', de: 'SKU: einmal definiert, mit eigener IRI.' })
    await sleep(4000)
    await scroll(page, 520, { ms: 1400 })
    await moveTo(page, page.getByText('ecom:sku').first())
    await sleep(3000)
    cue({ en: 'The reverse lookup: every data product that uses an SKU.', de: 'Die Rückwärtssuche: jedes Datenprodukt, das eine SKU nutzt.' })
    await moveTo(page, page.getByRole('link', { name: 'SKU Sales' }).first())
    await sleep(4500)
    await click(page, page.getByRole('link', { name: 'SKU Sales' }).first())
    await settle(page)
    cue({ en: 'On the SKU Sales page, its business concepts appear under Semantics.', de: 'Auf der Seite von SKU Sales stehen die fachlichen Begriffe unter Semantics.' })
    await sleep(1500)
    await scroll(page, 560, { ms: 1400 })
    await moveTo(page, page.getByRole('heading', { name: 'Semantics' }).first())
    await sleep(5500)
  },
}

export default {
  scenes: [
    {
      kind: 'card',
      eyebrow: 'Exercise 9 · optional',
      title: 'Semantics',
      subtitle: 'Define business concepts once and link your contracts to them by IRI.',
      caption: { en: 'Exercise 9: define business concepts once and link your contracts to them.', de: 'Übung 9: fachliche Begriffe einmal definieren und Kontrakte damit verknüpfen.' },
    },
    code('semantics.yaml', head, rest, [
      { en: 'Write the whole ontology in one file. The prefix ecom gives every concept a stable IRI.', de: 'Schreibe die ganze Ontologie in eine Datei. Das Präfix ecom gibt jedem Begriff eine stabile IRI.' },
      { en: 'Entities Order and Article, their properties, and how they relate.', de: 'Die Entitäten Order und Article, ihre Properties und wie sie zusammenhängen.' },
    ]),
    {
      kind: 'terminal',
      steps: [
        { ...cmd('upload', 'source .env'), hold: 800, caption: { en: 'Load the API key and host into your shell.', de: 'Lade API Key und Host in deine Shell.' } },
        { ...cmd('upload', 'curl'), hold: 3500, caption: { en: 'Upload the file in one go. One PUT replaces the whole namespace.', de: 'Lade die Datei in einem Rutsch hoch. Ein PUT ersetzt den ganzen Namespace.' } },
        { ...cmd('upload', 'concepts list'), hold: 6000, caption: { en: 'All five concepts are there.', de: 'Alle fünf Begriffe sind da.' } },
      ],
    },
    code('orders_v1.odcs.yaml', link, null, [
      { en: 'Link the contract fields to the concepts: authoritativeDefinitions with the IRI as url.', de: 'Verknüpfe die Kontraktfelder mit den Begriffen: authoritativeDefinitions mit der IRI als url.' },
    ]),
    {
      kind: 'terminal',
      steps: [
        { ...cmd('link', 'lint'), hold: 4000, caption: { en: 'The contracts stay valid.', de: 'Die Kontrakte bleiben gültig.' } },
        { ...cmd('republish'), hold: 5000, caption: { en: 'Re-publish the linked contracts.', de: 'Veröffentliche die verknüpften Kontrakte erneut.' } },
      ],
    },
    explore,
  ],
}
