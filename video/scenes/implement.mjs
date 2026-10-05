import { readFileSync } from 'node:fs'
import { command } from '../lib/mdx.mjs'
import { chatScene, codeScene } from '../lib/helpers-c.mjs'
import { click, showCursor, startEditor } from '../lib/browser.mjs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const c = (step, includes) => command('implement', step, includes)
const sql = readFileSync(new URL('../../.solutions/exercise5/sku_sales_per_year.sql', import.meta.url), 'utf8').trimEnd()
const contractPath = new URL('../../.solutions/exercise4/sku_sales_per_year.odcs.yaml', import.meta.url).pathname

// the part of the contract that specifies the view: columns, types, semantic roles
const spec = (() => {
  const lines = readFileSync(contractPath, 'utf8').split('\n')
  const from = lines.findIndex((l) => l.startsWith('schema:'))
  return lines.slice(from).filter((l) => /^(schema:|- name:|  physicalType:|  properties:|  - name:|    (semanticType|physicalType|transformLogic):)/.test(l)).join('\n')
})()

// live editor: run the contract tests against the implemented view
const editorTests = {
  kind: 'browser',
  async run({ page, cue, sleep, start }) {
    const ed = await startEditor({ workdir: join(tmpdir(), 'tutorial-videos', 'implement'), file: 'sku_sales_per_year.odcs.yaml', from: contractPath, port: 4360 })
    try {
      await page.goto(ed.url)
      await page.waitForSelector('#name')
      await showCursor(page)
      start()
      cue({ en: 'Back in the editor: the context tells agents how to query the product.', de: 'Zurück im Editor: Der Kontext sagt Agenten, wie sie das Produkt abfragen.' })
      await sleep(800)
      await click(page, page.getByRole('link', { name: 'Context' }), { pause: 5500 })
      cue({ en: 'And the same tests are one click away.', de: 'Und dieselben Tests sind einen Klick entfernt.' })
      await sleep(800)
      await click(page, page.getByRole('button', { name: 'Tests' }), { pause: 800 })
      await click(page, page.getByRole('button', { name: 'Run Test' }))
      await page.getByText('Passed', { exact: true }).last().waitFor({ timeout: 60000 })
      await sleep(1500)
      cue({ en: 'All checks of the view pass: types, uniqueness, and plausibility.', de: 'Alle Checks der View sind grün: Typen, Eindeutigkeit und Plausibilität.' })
      await page.mouse.wheel(0, 300)
      await sleep(4500)
    } finally {
      ed.stop()
    }
  },
}

export default {
  scenes: [
    {
      kind: 'card',
      eyebrow: 'Exercise 5',
      title: 'Implement Your Data Product',
      subtitle: 'Turn red tests green, with an AI coding agent or by hand.',
      caption: { en: 'Exercise 5: implement the SKU Sales data product.', de: 'Übung 5: das Datenprodukt SKU Sales implementieren.' },
    },
    {
      kind: 'terminal',
      steps: [
        {
          ...command('contract-first', 'test-red', 'datacontract test'),
          hold: 5500,
          caption: { en: 'Where we start: the contract exists, the view does not. Tests are red.', de: 'Ausgangslage: Der Kontrakt existiert, die View nicht. Die Tests sind rot.' },
        },
      ],
    },
    codeScene({
      file: 'sku_sales_per_year.odcs.yaml',
      code: spec,
      lineMs: 140,
      caption: { en: 'The contract is the specification: one view, four columns, exact types.', de: 'Der Kontrakt ist die Spezifikation: eine View, vier Spalten, exakte Typen.' },
      after: { en: 'Dimensions group the data, measures are aggregated. transformLogic says how.', de: 'Dimensionen gruppieren, Measures werden aggregiert. transformLogic sagt, wie.' },
      hold: 6000,
    }),
    chatScene({
      title: 'AI coding agent',
      prompt:
        'Implement a PostgreSQL view that fulfills the data contract in sku_sales_per_year.odcs.yaml. The source data is described by orders_v2.odcs.yaml. Write the SQL to sql/sku_sales_per_year.sql, apply it, and run datacontract test until all tests pass.',
      agent: [
        '› reading sku_sales_per_year.odcs.yaml (target) and orders_v2.odcs.yaml (source)',
        '› writing sql/sku_sales_per_year.sql',
        '› applying the view, running datacontract test',
      ],
      caption: { en: 'Option 1: let an AI coding agent do it. The contracts tell it exactly what to build.', de: 'Option 1: Lass einen KI-Coding-Agenten ran. Die Kontrakte sagen ihm genau, was zu bauen ist.' },
      after: { en: 'The tests give the agent a feedback loop to verify its own work.', de: 'Die Tests geben dem Agenten eine Rückkopplung, um seine Arbeit zu prüfen.' },
      hold: 6000,
    }),
    codeScene({
      file: 'sql/sku_sales_per_year.sql',
      code: sql,
      charMs: 32,
      caption: { en: 'Option 2: write the view by hand. Group by SKU and year.', de: 'Option 2: Schreib die View von Hand. Gruppiert nach SKU und Jahr.' },
      after: { en: 'Cast to int and bigint: the types are part of your contract.', de: 'Caste auf int und bigint: Die Typen sind Teil deines Kontrakts.' },
      hold: 6000,
    }),
    {
      kind: 'terminal',
      steps: [
        { ...c('manual', 'psql'), hold: 2500, caption: { en: 'Apply the SQL file to the database.', de: 'Wende die SQL-Datei auf die Datenbank an.' } },
        { ...c('green', 'datacontract test'), hold: 6500, caption: { en: 'Run the tests again: green. The implementation fulfills the contract.', de: 'Tests erneut ausführen: grün. Die Implementierung erfüllt den Kontrakt.' } },
      ],
    },
    {
      kind: 'terminal',
      steps: [
        { ...c('verified-statement', 'psql'), hold: 6000, caption: { en: 'Check the verified statement from the context: the top three SKUs of 2024.', de: 'Prüfe das Verified Statement aus dem Kontext: die drei Top-SKUs 2024.' } },
      ],
    },
    editorTests,
    {
      kind: 'terminal',
      steps: [
        { ...c('active', 'datacontract lint'), hold: 5500, caption: { en: 'Set contract and data product to active, and lint both. Done.', de: 'Setze Kontrakt und Datenprodukt auf active und linte beide. Fertig.' } },
      ],
    },
    {
      kind: 'card',
      eyebrow: 'Up next',
      title: 'Consumer-Driven Contracts',
      subtitle: 'Make your dependencies on orders_v2 explicit.',
      duration: 4000,
      caption: { en: 'Your data product is live. Next: consumer-driven contracts.', de: 'Dein Datenprodukt ist live. Als Nächstes: Consumer-driven Contracts.' },
    },
  ],
}
