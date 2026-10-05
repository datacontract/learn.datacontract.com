import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { writeFileSync, mkdirSync } from 'node:fs'
import { command } from '../lib/mdx.mjs'
import { click, moveTo, showCursor, startEditor, type } from '../lib/browser.mjs'
import { BASE, SCHEMA, SERVER, choose } from '../lib/helpers-a.mjs'

const c = (step, includes) => command('contract', step, includes)
const scratch = (name) => join(tmpdir(), 'tutorial-videos', 'contract', name)

/** writes a prepared contract state for a scene and returns its path */
function prepared(name, yaml) {
  const dir = scratch(`${name}-src`)
  mkdirSync(dir, { recursive: true })
  const path = join(dir, 'orders_v1.odcs.yaml')
  writeFileSync(path, yaml)
  return path
}

/** a browser scene in the Data Contract Editor, started on a contract state */
function editor(name, port, yaml, body) {
  return {
    kind: 'browser',
    async run(api) {
      const from = yaml === null ? undefined : yaml.endsWith('.yaml') ? yaml : prepared(name, yaml)
      const ed = await startEditor({ workdir: scratch(name), from, port })
      try {
        await api.page.goto(ed.url)
        await api.page.waitForSelector('#name')
        await showCursor(api.page)
        api.start()
        await body(api)
      } finally {
        ed.stop()
      }
    },
  }
}

const save = async (page, sleep) => {
  await click(page, page.getByRole('button', { name: 'Save' }), { pause: 1200 })
  await sleep(300)
}

const fundamentals = editor('fundamentals', 4341, null, async ({ page, cue, sleep }) => {
  cue({ en: 'The editor opens with a new, empty contract. Set the fundamentals.', de: 'Der Editor öffnet einen neuen, leeren Kontrakt. Setze die Grunddaten.' })
  await sleep(1500)
  await type(page, page.locator('#name'), 'Orders')
  await type(page, page.locator('#id'), 'orders_v1')
  await sleep(800)
  cue({ en: 'Version 1.0.0 and status draft stay as they are. Save writes the YAML file to disk.', de: 'Version 1.0.0 und Status draft bleiben. Save schreibt die YAML-Datei auf die Platte.' })
  await moveTo(page, page.locator('#version'))
  await sleep(1500)
  await save(page, sleep)
  await sleep(1200)
})

const server = editor('server', 4342, BASE, async ({ page, cue, sleep }) => {
  cue({ en: 'Go to Servers and add the PostgreSQL database.', de: 'Gehe zu Servers und füge die PostgreSQL-Datenbank hinzu.' })
  await sleep(800)
  await click(page, page.getByRole('link', { name: 'Servers' }))
  await click(page, page.getByRole('button', { name: 'Add Server' }), { pause: 700 })
  await type(page, page.locator('#server'), 'Orders')
  await choose(page, page.getByPlaceholder('Select server type...'), 'postgres', { click, type })
  await sleep(500)
  cue({ en: 'Host localhost, port 5433, database workshop, schema orders_v1.', de: 'Host localhost, Port 5433, Datenbank workshop, Schema orders_v1.' })
  await type(page, page.locator('#host'), 'localhost')
  await type(page, page.locator('#port'), '5433')
  await type(page, page.locator('#database'), 'workshop')
  await type(page, page.locator('#schema'), 'orders_v1')
  await sleep(700)
  await save(page, sleep)
  await sleep(1000)
})

/** names a property in the open panel and sets its logical and physical type */
async function property(page, sleep, name, logical, physical) {
  await type(page, page.locator('#propertyName'), name, { delay: 45 })
  await choose(page, page.getByPlaceholder('Select type...').last(), logical, { click, type })
  await type(page, page.getByPlaceholder('e.g., VARCHAR(255)'), physical, { delay: 60 })
  await page.keyboard.press('Enter')
  await sleep(500)
}

const schema = editor('schema', 4343, BASE + SERVER, async ({ page, cue, sleep }) => {
  cue({ en: 'Go to Schemas and add the orders table.', de: 'Gehe zu Schemas und füge die Tabelle orders hinzu.' })
  await sleep(800)
  await click(page, page.getByRole('link', { name: 'Schemas' }).first())
  await click(page, page.getByRole('button', { name: 'Add Schema' }), { pause: 700 })
  await type(page, page.locator('#schema-name-0'), 'orders')
  cue({ en: 'Add the properties, each with a logical type and the physical type in the database.', de: 'Füge die Properties hinzu, jeweils mit logischem Typ und physischem Typ der Datenbank.' })
  await click(page, page.getByText('Add property'), { pause: 700 })
  await click(page, page.getByText('unnamed property'), { pause: 700 })
  await property(page, sleep, 'order_id', 'string', 'TEXT')
  await click(page, page.getByRole('button', { name: 'Close panel' }), { pause: 500 })
  await click(page, page.getByTitle('Add property'), { pause: 500 })
  await click(page, page.getByText('unnamed property'), { pause: 700 })
  await property(page, sleep, 'order_timestamp', 'date', 'TIMESTAMPTZ')
  await click(page, page.getByRole('button', { name: 'Close panel' }), { pause: 800 })
  cue({ en: 'The other properties of orders and line_items follow the same way.', de: 'Die übrigen Properties von orders und line_items gehen genauso.' })
  await sleep(2500)
})

const allProperties = editor('all-properties', 4344, BASE + SERVER + SCHEMA, async ({ page, cue, sleep }) => {
  cue({ en: 'Both tables, fully described. The Diagram view gives an overview.', de: 'Beide Tabellen, vollständig beschrieben. Die Diagramm-Ansicht gibt einen Überblick.' })
  await sleep(800)
  await click(page, page.getByRole('link', { name: 'orders' }).first(), { pause: 1500 })
  await click(page, page.getByRole('button', { name: 'Diagram' }), { pause: 1200 })
  // dismiss the "Draw a relationship" hint that covers the first table
  const hint = page.getByText('Draw a relationship').locator('xpath=ancestor::div[1]/..').getByRole('button').first()
  if (await hint.count()) await click(page, hint, { pause: 600 })
  await sleep(3000)
})

const classification = editor('classification', 4345, BASE + SERVER + SCHEMA, async ({ page, cue, sleep }) => {
  cue({ en: 'customer_email_address is personal data: classify it as confidential.', de: 'customer_email_address ist ein personenbezogenes Datum: Klassifiziere es als confidential.' })
  await sleep(800)
  await click(page, page.getByRole('link', { name: 'orders' }).first(), { pause: 800 })
  await click(page, page.getByText('customer_email_address').first(), { pause: 900 })
  await click(page, page.getByRole('button', { name: 'Classification & Security' }), { pause: 700 })
  await type(page, page.locator('#classification'), 'confidential')
  await sleep(600)
  cue({ en: 'Mark it as required. The test then checks for missing values.', de: 'Markiere es als required. Der Test prüft dann auf fehlende Werte.' })
  await click(page, page.getByRole('button', { name: 'Constraints' }), { pause: 700 })
  await click(page, page.locator('#required'), { pause: 300 })
  await page.locator('#required').selectOption({ label: 'True' })
  await sleep(900)
  await click(page, page.getByRole('button', { name: 'Close panel' }), { pause: 600 })
  await save(page, sleep)
  await sleep(1000)
})

const context = editor('context', 4346, BASE + SERVER + SCHEMA, async ({ page, cue, sleep }) => {
  cue({ en: 'New in ODCS 3.2: context for AI agents. Open Context.', de: 'Neu in ODCS 3.2: Kontext für KI-Agenten. Öffne Context.' })
  await sleep(800)
  await click(page, page.getByRole('link', { name: 'Context' }), { pause: 800 })
  await type(page, page.getByPlaceholder(/How this data should be used/), 'Orders of the e-commerce platform. order_total is in cents. Timestamps are in UTC.', { delay: 28 })
  cue({ en: 'A verified statement: a question with a curated SQL answer that agents should reuse.', de: 'Ein Verified Statement: eine Frage mit einer geprüften SQL-Antwort, die Agenten wiederverwenden.' })
  await click(page, page.getByRole('button', { name: '+ Add statement' }), { pause: 500 })
  await type(page, page.getByPlaceholder('Question').last(), 'How many orders were placed in 2023?', { delay: 30 })
  await type(page, page.getByPlaceholder('Verified answer (optional)').last(), 'SELECT COUNT(*) FROM orders_v1.orders WHERE EXTRACT(YEAR FROM order_timestamp) = 2023;', { delay: 18 })
  cue({ en: 'A constraint: what agents must never do.', de: 'Ein Constraint: was Agenten niemals tun dürfen.' })
  await click(page, page.getByRole('button', { name: '+ Add constraint' }), { pause: 500 })
  await type(page, page.getByPlaceholder('Constraint').last(), 'Never output customer_email_address or customer_id.', { delay: 30 })
  await sleep(600)
  await save(page, sleep)
  await sleep(1500)
})

// the final contract from the solutions, tested from the editor's Tests panel
const editorTests = editor('tests', 4347, new URL('../../.solutions/exercise1/orders_v1.odcs.yaml', import.meta.url).pathname, async ({ page, cue, sleep }) => {
  cue({ en: 'Tip: you can run the tests right in the editor, too.', de: 'Tipp: Du kannst die Tests auch direkt im Editor ausführen.' })
  await sleep(1000)
  await click(page, page.getByRole('button', { name: 'Tests' }), { pause: 800 })
  await click(page, page.getByRole('button', { name: 'Run Test' }))
  await page.getByText('Passed', { exact: true }).last().waitFor({ timeout: 60000 })
  cue({ en: 'All checks pass: schema, types, and quality rules.', de: 'Alle Checks bestehen: Schema, Typen und Quality-Regeln.' })
  await sleep(4000)
})

export default {
  scenes: [
    {
      kind: 'card',
      eyebrow: 'Exercise 1',
      title: 'Put Your Data Under Contract',
      subtitle: 'Write your first ODCS data contract and test it against PostgreSQL.',
      caption: { en: 'Exercise 1: put your data under contract.', de: 'Übung 1: Daten unter Vertrag nehmen.' },
    },
    {
      kind: 'terminal',
      steps: [
        { ...c('create', 'datacontract edit'), hold: 3500, caption: { en: 'Create the contract and open it in the Data Contract Editor.', de: 'Lege den Kontrakt an und öffne ihn im Data Contract Editor.' } },
      ],
    },
    fundamentals,
    server,
    schema,
    allProperties,
    {
      kind: 'terminal',
      steps: [
        { ...c('test', 'datacontract test'), hold: 6000, caption: { en: 'Test the contract against the real database. All checks pass.', de: 'Teste den Kontrakt gegen die echte Datenbank. Alle Checks sind grün.' } },
        { ...c('test-fail', 'datacontract test'), hold: 6000, caption: { en: 'Change a physical type on purpose: the test catches the mismatch.', de: 'Ändere absichtlich einen physischen Typ: Der Test findet die Abweichung.' } },
      ],
    },
    classification,
    {
      kind: 'terminal',
      steps: [
        { ...c('test-again', 'datacontract test'), hold: 5000, caption: { en: 'Test again: required adds a check for missing values.', de: 'Teste erneut: required ergänzt einen Check auf fehlende Werte.' } },
        { ...c('quality', 'datacontract test'), hold: 5500, caption: { en: 'Add a SQL quality check: every email contains an @.', de: 'Ergänze einen SQL-Quality-Check: Jede E-Mail enthält ein @.' } },
      ],
    },
    context,
    {
      kind: 'terminal',
      steps: [
        { ...c('synonyms', 'datacontract lint'), hold: 4500, caption: { en: 'Add synonyms and lint the contract against ODCS 3.2.', de: 'Ergänze Synonyme und prüfe den Kontrakt mit lint gegen ODCS 3.2.' } },
        { ...c('sla', 'slaProperties'), hold: 5000, caption: { en: 'Service levels: retention with a timestamp column becomes a real check.', de: 'Service Levels: Retention mit Zeitstempel-Spalte wird zum echten Check.' } },
        { ...c('freshness', 'slaProperties'), hold: 6500, caption: { en: 'A freshness check fails: the sample data is a static snapshot. Remove it again.', de: 'Ein Freshness-Check schlägt fehl: Die Beispieldaten sind ein fester Stand. Wieder entfernen.' } },
        { ...c('active', 'datacontract test'), hold: 6000, caption: { en: 'Add team and support, set the status to active, and test one last time.', de: 'Ergänze Team und Support, setze den Status auf active und teste ein letztes Mal.' } },
      ],
    },
    editorTests,
    {
      kind: 'card',
      eyebrow: 'Done',
      title: 'Your first data contract',
      subtitle: 'Next: evolve it with a breaking change.',
      duration: 3000,
      caption: { en: 'Done. Next: data contract evolution.', de: 'Fertig. Als Nächstes: Evolution von Datenkontrakten.' },
    },
  ],
}
