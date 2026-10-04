import { command } from '../lib/mdx.mjs'
import { showCursor, startEditor } from '../lib/browser.mjs'
import { choose, click, codeScene, combobox, freshDir, nav, save, type } from '../lib/helpers-b.mjs'

const c = (step, includes) => command('contract-first', step, includes)

const properties = [
  { name: 'sku', logical: ['str', 'string'], physical: 'TEXT', semantic: 'dimension' },
  { name: 'year', logical: ['int', 'integer'], physical: 'INTEGER', semantic: 'dimension' },
  { name: 'order_count', logical: ['int', 'integer'], physical: 'BIGINT', semantic: 'measure', transform: 'COUNT(*)' },
  { name: 'total_quantity', logical: ['int', 'integer'], physical: 'BIGINT', semantic: 'measure', transform: 'SUM(line_items.quantity)' },
]

// live editor: design the sku_sales_per_year contract from scratch
const design = {
  kind: 'browser',
  async run({ page, cue, sleep, start }) {
    const dir = freshDir('contract-first', 'design')
    const ed = await startEditor({ workdir: dir, file: 'sku_sales_per_year.odcs.yaml', port: 4356 })
    try {
      await page.goto(ed.url)
      await page.waitForSelector('#name')
      await showCursor(page)
      start()
      cue({ en: 'Contract first: design the interface before writing any SQL.', de: 'Contract-first: Entwirf die Schnittstelle, bevor du SQL schreibst.' })
      await sleep(2000)
      await type(page, page.locator('#name'), 'SKU Sales per Year', { delay: 45 })
      await type(page, page.locator('#id'), 'sku_sales_per_year', { delay: 45 })
      await sleep(1000)

      cue({ en: 'The server: the analytics schema, where the view will live.', de: 'Der Server: das Schema analytics, in dem die View liegen wird.' })
      await nav(page, 'Servers')
      await click(page, page.getByRole('button', { name: 'Add Server' }), { pause: 900 })
      await type(page, page.locator('#server'), 'postgres')
      await combobox(page, page.getByRole('combobox', { name: 'Type' }), 'postg', 'postgres')
      await type(page, page.locator('input#host:visible').first(), 'localhost')
      await type(page, page.locator('input#port:visible').first(), '5433')
      await type(page, page.locator('input#database:visible').first(), 'workshop')
      await type(page, page.locator('input#schema:visible').first(), 'analytics')
      await sleep(1200)

      cue({ en: 'The schema: a view called sku_sales_per_year.', de: 'Das Schema: eine View namens sku_sales_per_year.' })
      await nav(page, 'Schemas')
      await click(page, page.getByRole('button', { name: 'Add Schema' }), { pause: 900 })
      await type(page, page.locator('#schema-name-0'), 'sku_sales_per_year', { delay: 45 })
      await click(page, page.getByRole('button', { name: 'Advanced Metadata' }), { pause: 600 })
      await type(page, page.locator('#schema-physical-type-0'), 'VIEW')
      await click(page, page.getByRole('button', { name: 'Advanced Metadata' }), { pause: 800 })

      for (const [i, prop] of properties.entries()) {
        if (i === 0) cue({ en: 'Four properties: sku and year are dimensions for grouping.', de: 'Vier Properties: sku und year sind Dimensionen zum Gruppieren.' })
        if (i === 2) cue({ en: 'order_count and total_quantity are measures, with their aggregation as transformLogic.', de: 'order_count und total_quantity sind Measures, mit ihrer Aggregation als transformLogic.' })
        await click(page, page.getByRole('button', { name: 'Add property' }).first(), { pause: 600 })
        await click(page, page.getByText('unnamed property'), { pause: 900 })
        await type(page, page.locator('#propertyName'), prop.name, { delay: 45 })
        await combobox(page, page.getByRole('combobox', { name: 'Logical Type' }), prop.logical[0], prop.logical[1])
        await choose(page, page.locator('select').filter({ has: page.locator('option', { hasText: 'measure' }) }).first(), prop.semantic)
        await combobox(page, page.getByRole('combobox', { name: 'Physical Type' }), prop.physical)
        if (prop.transform) {
          await click(page, page.getByRole('button', { name: 'Transformations' }), { pause: 500 })
          await type(page, page.getByPlaceholder('SQL or transformation code...'), prop.transform, { delay: 45 })
        }
        await sleep(700)
        await click(page, page.getByRole('button', { name: 'Close panel' }), { pause: 700 })
      }
      await sleep(1500)

      cue({ en: 'Context tells AI agents how to query the product correctly.', de: 'Der Kontext sagt KI-Agenten, wie sie das Produkt richtig abfragen.' })
      await nav(page, 'Context')
      await type(page, page.getByPlaceholder('How this data should be used, joined, and interpreted…'),
        'One row per SKU and year. Sum order_count or total_quantity across years for totals.', { delay: 30 })
      await click(page, page.getByRole('button', { name: '+ Add statement' }), { pause: 600 })
      await type(page, page.getByPlaceholder('Question').last(), 'Which three SKUs sold the most units in 2024?', { delay: 30 })
      await sleep(1500)
      cue({ en: 'Save. The contract is the specification for the implementation.', de: 'Speichern. Der Kontrakt ist die Spezifikation für die Implementierung.' })
      await save(page)
      await sleep(2500)
    } catch (e) {
      await page.screenshot({ path: '/tmp/tutorial-videos/contract-first-failure.png' })
      throw e
    } finally {
      ed.stop()
    }
  },
}

export default {
  scenes: [
    {
      kind: 'card',
      eyebrow: 'Exercise 4',
      title: 'Design Contract-First',
      subtitle: 'Design a consumer-aligned data product before writing a single line of SQL.',
      caption: { en: 'Exercise 4: design contract-first.', de: 'Übung 4: Contract-first entwerfen.' },
    },
    {
      kind: 'card',
      eyebrow: 'Scenario',
      title: 'How often is each SKU bought per year?',
      subtitle: 'The purchasing team needs it for supplier negotiations. You build SKU Sales on top of orders_v2.',
      duration: 6000,
      caption: { en: 'The purchasing team wants SKU sales per year. You build the data product.', de: 'Das Einkaufsteam will SKU-Verkäufe pro Jahr. Du baust das Datenprodukt.' },
    },
    {
      kind: 'terminal',
      steps: [
        { ...c('create', 'datacontract edit'), hold: 3000, caption: { en: 'Create the new contract and open it in the editor.', de: 'Lege den neuen Kontrakt an und öffne ihn im Editor.' } },
      ],
    },
    design,
    {
      kind: 'terminal',
      steps: [
        { ...c('test-red', 'datacontract test'), hold: 6000, caption: { en: 'Run the tests: red. The view does not exist yet, and that is the point.', de: 'Tests ausführen: rot. Die View existiert noch nicht, genau das ist der Punkt.' } },
      ],
    },
    codeScene({
      file: 'sku_sales_per_year.odps.yaml',
      charMs: 30,
      endHold: 2500,
      parts: [
        {
          caption: { en: 'The data product: consumerAligned, with an input port on orders_v2.', de: 'Das Datenprodukt: consumerAligned, mit einem Input-Port auf orders_v2.' },
          text: `apiVersion: v1.1.0
kind: DataProduct
id: sku_sales
name: SKU Sales
status: draft
type: consumerAligned
domain: ecommerce
inputPorts:
  - name: orders
    version: 2.0.0
    contractId: orders_v2
outputPorts:
  - name: sku_sales_per_year
    version: 1.0.0
    contractId: sku_sales_per_year
`,
          hold: 3500,
        },
      ],
    }),
    {
      kind: 'terminal',
      steps: [
        { ...c('lint', 'dataproduct lint'), hold: 4500, caption: { en: 'Valid ODPS 1.1. Consumers can review the interface now. Next: implement it.', de: 'Gültiges ODPS 1.1. Konsumenten können die Schnittstelle jetzt prüfen. Als Nächstes: implementieren.' } },
      ],
    },
  ],
}
