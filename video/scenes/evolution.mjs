import { command } from '../lib/mdx.mjs'
import { showCursor, startEditor } from '../lib/browser.mjs'
import { choose, click, combobox, freshDir, nav, prepare, runTests, save, showYaml, type } from '../lib/helpers-b.mjs'

const c = (step, includes) => command('evolution', step, includes)

// live editor: turn the copied v1 contract into orders_v2
const editV2 = {
  kind: 'browser',
  async run({ page, cue, sleep, start }) {
    const dir = freshDir('evolution', 'v2')
    // the copy of v1, with the SQL of quality checks and verified statements already on orders_v2
    prepare(dir, 'orders_v2.odcs.yaml', '.solutions/exercise1/orders_v1.odcs.yaml', (s) =>
      s.replaceAll('orders_v1.', 'orders_v2.').replace('status: active', 'status: draft'))
    const ed = await startEditor({ workdir: dir, file: 'orders_v2.odcs.yaml', port: 4352 })
    try {
      await page.goto(ed.url)
      await page.waitForSelector('#name')
      await showCursor(page)
      start()
      cue({ en: 'Open the copy in the editor. It still says orders_v1.', de: 'Öffne die Kopie im Editor. Sie heißt noch orders_v1.' })
      await sleep(2500)
      cue({ en: 'New major version: ID orders_v2, version 2.0.0.', de: 'Neue Major-Version: ID orders_v2, Version 2.0.0.' })
      await type(page, page.locator('#id'), 'orders_v2')
      await type(page, page.locator('#version'), '2.0.0')
      await sleep(1200)

      cue({ en: 'Point the server to the orders_v2 schema.', de: 'Lass den Server auf das Schema orders_v2 zeigen.' })
      await nav(page, 'postgres', false)
      await type(page, page.locator('input#schema:visible').first(), 'orders_v2')
      await sleep(1200)

      cue({ en: 'Add the new quantity property to line_items.', de: 'Ergänze die neue Property quantity in line_items.' })
      await nav(page, 'line_items')
      await click(page, page.getByText('Properties', { exact: true }).locator('xpath=..').locator('button').first(), { pause: 600 })
      await click(page, page.getByText('unnamed property'), { pause: 900 })
      await type(page, page.locator('#propertyName'), 'quantity')
      await combobox(page, page.getByRole('combobox', { name: 'Logical Type' }), 'int', 'integer')
      await combobox(page, page.getByRole('combobox', { name: 'Physical Type' }), 'BIGINT')

      cue({ en: 'Add a quality rule: quantity must be greater than 0.', de: 'Ergänze eine Quality-Regel: quantity muss größer als 0 sein.' })
      await click(page, page.getByRole('button', { name: 'Data Quality' }), { pause: 500 })
      await click(page, page.getByRole('button', { name: '+ Add' }).last(), { pause: 600 })
      await click(page, page.getByText('New rule'), { pause: 600 })
      const ruleType = page.locator('select').filter({ has: page.locator('option', { hasText: 'Library (Metric)' }) }).first()
      await choose(page, ruleType, 'SQL')
      await type(page, page.getByPlaceholder('Human-readable explanation of the check'), 'Ensure quantity is positive', { delay: 35 })
      await type(page, page.getByPlaceholder('SELECT COUNT(*) FROM {object} WHERE...'), 'SELECT COUNT(*) FROM orders_v2.line_items WHERE quantity <= 0;', { delay: 30 })
      await combobox(page, page.getByPlaceholder('Select operator...'), 'Must Be', 'Must Be (=)')
      await type(page, page.getByPlaceholder('Select operator first').or(page.locator('input[type=number]')).first(), '0')
      await sleep(800)
      await click(page, page.getByRole('button', { name: 'Close panel' }), { pause: 600 })

      cue({ en: 'Save, then run the tests against orders_v2.', de: 'Speichern, dann die Tests gegen orders_v2 laufen lassen.' })
      await save(page)
      await runTests(page, { hold: 4500 })
      cue({ en: 'The editor wrote everything to the YAML file.', de: 'Der Editor hat alles in die YAML-Datei geschrieben.' })
      await showYaml(page, 'name: "quantity"', { hold: 6500 })
    } finally {
      ed.stop()
    }
  },
}

export default {
  scenes: [
    {
      kind: 'card',
      eyebrow: 'Exercise 2',
      title: 'Data Contract Evolution',
      subtitle: 'Release a breaking change as a new major version and migrate.',
      caption: { en: 'Exercise 2: data contract evolution.', de: 'Übung 2: Evolution von Datenkontrakten.' },
    },
    {
      kind: 'terminal',
      steps: [
        { ...c('explore', 'psql'), hold: 6000, caption: { en: 'The orders team adds a quantity column in the new schema orders_v2.', de: 'Das Orders-Team ergänzt die Spalte quantity im neuen Schema orders_v2.' } },
        { ...c('copy', 'cp'), hold: 3500, caption: { en: 'Start v2 as a copy of the v1 contract.', de: 'Starte v2 als Kopie des v1-Kontrakts.' } },
      ],
    },
    editV2,
    {
      kind: 'terminal',
      steps: [
        { ...c('changelog', 'changelog'), hold: 7000, caption: { en: 'datacontract changelog lists every difference between v1 and v2.', de: 'datacontract changelog listet jeden Unterschied zwischen v1 und v2.' } },
        { ...c('breaking', 'datacontract breaking orders_v1'), hold: 7000, caption: { en: 'datacontract breaking rates each change. Adding a column is not breaking for the tool.', de: 'datacontract breaking bewertet jede Änderung. Eine neue Spalte ist für das Tool kein Breaking Change.' } },
      ],
    },
    {
      kind: 'terminal',
      steps: [
        { ...c('breaking', 'orders_v2.before'), hold: 7000, caption: { en: 'Changing a type is breaking: ERROR and exit code 1.', de: 'Einen Typ zu ändern ist breaking: ERROR und Exit-Code 1.' } },
      ],
    },
    {
      kind: 'terminal',
      steps: [
        { ...c('deprecate-field', 'datacontract breaking'), hold: 7000, caption: { en: 'New in ODCS 3.2: mark a field deprecated first. That is only INFO.', de: 'Neu in ODCS 3.2: Markiere ein Feld zuerst als deprecated. Das ist nur INFO.' } },
        { ...c('deprecate', 'datacontract lint'), hold: 5500, caption: { en: 'Lifecycle: draft, active, deprecated, retired. Set v1 to deprecated with an end of support date.', de: 'Lebenszyklus: draft, active, deprecated, retired. Setze v1 auf deprecated mit einem Support-Ende.' } },
        { ...c('migrate', 'datacontract test'), hold: 5000, caption: { en: 'Release v2 as active and retire v1. Done.', de: 'Gib v2 als active frei und setze v1 auf retired. Fertig.' } },
      ],
    },
  ],
}
