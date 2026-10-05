import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { command } from '../lib/mdx.mjs'
import { click, showCursor, startEditor, type } from '../lib/browser.mjs'
import { codeScene } from '../lib/helpers-c.mjs'

const c = (step, includes) => command('consumer-driven', step, includes)
const solution = (path) => new URL(`../../.solutions/${path}`, import.meta.url).pathname
const scratch = (name) => join(tmpdir(), 'tutorial-videos', 'consumer-driven', name)
const inputSql = readFileSync(solution('exercise6/sku_sales_input.sql'), 'utf8').trimEnd()
const rebasedSql = readFileSync(solution('exercise6/sku_sales_per_year.sql'), 'utf8').trimEnd()
// the consumer contract without team/support, to show its core on one screen
const consumerYaml = readFileSync(solution('exercise6/orders_v2.consumer_sku_sales.odcs.yaml'), 'utf8').split('\nteam:')[0].trimEnd()

async function deleteProperty(page, name) {
  await click(page, page.getByText(name, { exact: true }).first(), { pause: 700 })
  await click(page, page.getByRole('button', { name: 'Delete Property' }), { pause: 700 })
}

// live editor: copy of orders_v2, new ID, strip the properties the view does not use
const strip = {
  kind: 'browser',
  async run({ page, cue, sleep, start }) {
    const ed = await startEditor({ workdir: scratch('strip'), file: 'orders_v2.consumer_sku_sales.odcs.yaml', from: solution('exercise2/orders_v2.odcs.yaml'), port: 4362 })
    try {
      await page.goto(ed.url)
      await page.waitForSelector('#name')
      await showCursor(page)
      start()
      cue({ en: 'This is your contract now. Give it its own ID, the version stays 2.0.0.', de: 'Das ist jetzt dein Kontrakt. Gib ihm eine eigene ID, die Version bleibt 2.0.0.' })
      await sleep(1000)
      await type(page, page.locator('#id'), 'orders_v2_consumer_sku_sales', { delay: 45 })
      await sleep(800)
      cue({ en: 'Keep only what your view reads: order_id and order_timestamp from orders.', de: 'Behalte nur, was deine View liest: order_id und order_timestamp aus orders.' })
      await click(page, page.getByRole('link', { name: 'orders', exact: true }), { pause: 1200 })
      for (const name of ['order_total', 'customer_id', 'customer_email_address']) await deleteProperty(page, name)
      await sleep(1200)
      cue({ en: 'From line_items: order_id, sku, and quantity.', de: 'Aus line_items: order_id, sku und quantity.' })
      await click(page, page.getByRole('link', { name: 'line_items', exact: true }), { pause: 1200 })
      await deleteProperty(page, 'lines_item_id')
      await sleep(1000)
      cue({ en: 'Keep the quantity > 0 check: your data product relies on it.', de: 'Behalte den Check quantity > 0: Dein Datenprodukt verlässt sich darauf.' })
      await sleep(3500)
      await click(page, page.getByRole('button', { name: 'Save' }), { pause: 1200 })
    } finally {
      ed.stop()
    }
  },
}

// live editor: the finished consumer contract (owner, server, context) and its tests
const finished = {
  kind: 'browser',
  async run({ page, cue, sleep, start }) {
    const ed = await startEditor({ workdir: scratch('final'), file: 'orders_v2.consumer_sku_sales.odcs.yaml', from: solution('exercise6/orders_v2.consumer_sku_sales.odcs.yaml'), port: 4363 })
    try {
      await page.goto(ed.url)
      await page.waitForSelector('#name')
      await showCursor(page)
      start()
      cue({ en: 'Change the owner: the purchasing analytics team owns this contract.', de: 'Ändere den Owner: Das Purchasing Analytics Team besitzt diesen Kontrakt.' })
      await sleep(800)
      await click(page, page.getByRole('link', { name: 'Team', exact: true }), { pause: 4000 })
      cue({ en: 'The server points to sku_sales_input, where your access views live.', de: 'Der Server zeigt auf sku_sales_input, wo deine Zugriffs-Views liegen.' })
      await click(page, page.getByRole('link', { name: 'postgres', exact: true }), { pause: 4500 })
      cue({ en: 'With the views in place, the tests pass in the editor, too.', de: 'Mit den Views sind die Tests auch im Editor grün.' })
      await click(page, page.getByRole('button', { name: 'Tests' }), { pause: 800 })
      await click(page, page.getByRole('button', { name: 'Run Test' }))
      await page.getByText('Passed', { exact: true }).last().waitFor({ timeout: 60000 })
      await sleep(5000)
    } finally {
      ed.stop()
    }
  },
}

export default {
  scenes: [
    {
      kind: 'card',
      eyebrow: 'Exercise 6',
      title: 'Consumer-Driven Contracts',
      subtitle: 'Make your dependencies explicit with a consumer-driven contract.',
      caption: { en: 'Exercise 6: consumer-driven contracts.', de: 'Übung 6: Consumer-driven Contracts.' },
    },
    {
      kind: 'card',
      eyebrow: 'The problem',
      title: 'Your view depends on all of orders_v2',
      subtitle: 'It reads the producer tables directly, but needs only five fields.',
      duration: 5500,
      caption: { en: 'Today, any change to orders_v2 could break you. And the producer cannot see what you use.', de: 'Heute kann jede Änderung an orders_v2 dich brechen. Und der Producer sieht nicht, was du nutzt.' },
    },
    {
      kind: 'terminal',
      steps: [
        {
          ...c('copy', 'cp orders_v2'),
          hold: 3000,
          caption: { en: 'Your view needs only five fields of orders_v2. Start from a copy of the producer contract.', de: 'Deine View braucht nur fünf Felder aus orders_v2. Starte mit einer Kopie des Producer-Kontrakts.' },
        },
      ],
    },
    strip,
    codeScene({
      file: 'orders_v2.consumer_sku_sales.odcs.yaml',
      code: consumerYaml,
      lineMs: 70,
      caption: { en: 'The result: a small contract with exactly your dependencies, owned by you.', de: 'Das Ergebnis: ein kleiner Kontrakt mit genau deinen Abhängigkeiten, in deiner Verantwortung.' },
      after: { en: 'Server schema sku_sales_input, physical type view: this is where your access views live.', de: 'Server-Schema sku_sales_input, physischer Typ view: Hier liegen deine Zugriffs-Views.' },
      hold: 6500,
    }),
    {
      kind: 'terminal',
      steps: [
        {
          ...c('test-red', 'datacontract test'),
          hold: 7000,
          caption: { en: 'The server now points to sku_sales_input. The views do not exist yet: red.', de: 'Der Server zeigt jetzt auf sku_sales_input. Die Views gibt es noch nicht: rot.' },
        },
      ],
    },
    codeScene({
      file: 'sql/sku_sales_input.sql',
      code: inputSql,
      charMs: 30,
      caption: { en: 'Create access views that expose exactly the contracted fields.', de: 'Lege Zugriffs-Views an, die genau die vereinbarten Felder zeigen.' },
      after: { en: 'Everything else in orders_v2 stays hidden from your data product.', de: 'Alles andere in orders_v2 bleibt für dein Datenprodukt unsichtbar.' },
      hold: 5000,
    }),
    {
      kind: 'terminal',
      steps: [
        { ...c('views', 'psql'), hold: 2500, caption: { en: 'Apply the views.', de: 'Wende die Views an.' } },
        { ...c('test-green', 'datacontract test'), hold: 7000, caption: { en: 'Test the consumer contract again: green.', de: 'Teste den Consumer-Kontrakt erneut: grün.' } },
      ],
    },
    finished,
    codeScene({
      file: 'sql/sku_sales_per_year.sql',
      code: rebasedSql,
      lineMs: 260,
      caption: { en: 'Rebase your data product: read from sku_sales_input instead of orders_v2.', de: 'Baue dein Datenprodukt um: Es liest aus sku_sales_input statt aus orders_v2.' },
      hold: 5000,
    }),
    {
      kind: 'terminal',
      steps: [
        { ...c('rebase', 'psql'), hold: 2500, caption: { en: 'Recreate the view.', de: 'Lege die View neu an.' } },
        { ...c('verify', 'datacontract test'), hold: 7000, caption: { en: 'Your own consumers are unaffected: the SKU Sales tests stay green.', de: 'Deine eigenen Konsumenten merken nichts: Die SKU-Sales-Tests bleiben grün.' } },
      ],
    },
    {
      kind: 'card',
      eyebrow: 'Why it matters',
      title: 'The producer can run your contract in their CI',
      subtitle: 'Changes that would break you are caught before they ship.',
      duration: 5000,
      caption: { en: 'The orders team can run your contract in their pipeline. That is the next exercise.', de: 'Das Orders-Team kann deinen Kontrakt in seiner Pipeline ausführen. Das ist die nächste Übung.' },
    },
  ],
}
