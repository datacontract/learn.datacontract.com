import { readFileSync } from 'node:fs'
import { command } from '../lib/mdx.mjs'
import { codeScene } from '../lib/helpers-c.mjs'

const c = (step, includes) => command('ci-cd', step, includes)
const shot = (name) => `../tutorial/public/screenshots/${name}`

// the reference workflow, built up in three parts like in the chapter
const workflow = readFileSync(new URL('../../.solutions/exercise7/datacontract.yml', import.meta.url), 'utf8').split('\n')
const part = (from, to) => workflow.slice(from - 1, to).join('\n')
const lint = part(1, 37)
const tests = part(38, 49)
const breaking = part(61, 94)
const FILE = '.github/workflows/datacontract.yml'

// real outputs of the same checks, run locally on broken copies (logicalType text, physicalType integer)
const brokenLint = "╭────────┬────────────────────────────────────────┬───────┬────────────────────────────────────────╮\n│ Result │ Check                                  │ Field │ Details                                │\n├────────┼────────────────────────────────────────┼───────┼────────────────────────────────────────┤\n│ failed │ Check that data contract is valid      │       │ data.schema.orders.properties.order_i… │\n│        │ against ODCS v3.2.0                    │       │ must be one of ['string', 'date',      │\n│        │                                        │       │ 'timestamp', 'time', 'number',         │\n│        │                                        │       │ 'integer', 'object', 'array',          │\n│        │                                        │       │ 'boolean', 'map', 'vector']            │\n╰────────┴────────────────────────────────────────┴───────┴────────────────────────────────────────╯\n🔴 data contract is invalid, found the following errors:\n1) Check that data contract is valid against ODCS v3.2.0: \ndata.schema.orders.properties.order_id.logicalType must be one of ['string', 'date', 'timestamp', \n'time', 'number', 'integer', 'object', 'array', 'boolean', 'map', 'vector']"
const brokenTest = "Testing sku_sales_per_year.odcs.yaml\nServer: postgres (type=postgres, host=localhost, port=5433, database=workshop, schema=analytics)\n╭────────┬────────────────────────────────────┬────────────────┬───────────────────────────────────╮\n│ Result │ Check                              │ Field          │ Details                           │\n├────────┼────────────────────────────────────┼────────────────┼───────────────────────────────────┤\n│ failed │ Check that field total_quantity    │ total_quantity │ expected physical type 'integer'  │\n│        │ has physical type integer          │                │ but the column is 'bigint'        │\n│ passed │ Ensure the view has data           │                │                                   │\n│ passed │ Check that field 'order_count' is  │ order_count    │                                   │\n…\n│ passed │ Ensure year is plausible           │ year           │                                   │\n╰────────┴────────────────────────────────────┴────────────────┴───────────────────────────────────╯\n🔴 data contract is invalid, found the following errors:\n1) total_quantity Check that field total_quantity has physical type integer: expected physical type \n'integer' but the column is 'bigint'"

export default {
  scenes: [
    {
      kind: 'card',
      eyebrow: 'Exercise 7',
      title: 'CI/CD with GitHub Actions',
      subtitle: 'Test every change automatically and block breaking changes in pull requests.',
      caption: { en: 'Exercise 7: CI/CD with GitHub Actions in your own fork.', de: 'Übung 7: CI/CD mit GitHub Actions in deinem eigenen Fork.' },
    },
    {
      kind: 'card',
      eyebrow: 'Contracts as code',
      title: 'Three checks on every change',
      subtitle: 'Syntax (lint), reality (test against the database), compatibility (breaking).',
      duration: 6000,
      caption: { en: 'The pipeline runs three checks: syntax, reality, and compatibility.', de: 'Die Pipeline prüft dreierlei: Syntax, Realität und Kompatibilität.' },
    },
    {
      kind: 'terminal',
      steps: [
        {
          ...c('commit', 'git add'),
          hold: 7000,
          caption: { en: 'Remove the exercise files from .gitignore, then commit and push them to your fork.', de: 'Nimm die Übungsdateien aus .gitignore, dann committe und pushe sie in deinen Fork.' },
        },
      ],
    },
    codeScene({
      file: FILE,
      code: lint,
      lineMs: 200,
      caption: { en: 'Create the workflow. First: install the pinned CLIs and lint all files.', de: 'Lege den Workflow an. Zuerst: gepinnte CLIs installieren und alle Dateien linten.' },
      after: { en: 'Lint checks the syntax against the ODCS and ODPS standards.', de: 'Lint prüft die Syntax gegen die Standards ODCS und ODPS.' },
      hold: 4500,
    }),
    codeScene({
      file: FILE,
      prefix: lint,
      code: tests,
      lineMs: 280,
      caption: { en: 'Then test against reality: start the database, create the views, run datacontract ci.', de: 'Dann gegen die Realität testen: Datenbank starten, Views anlegen, datacontract ci ausführen.' },
      hold: 5000,
    }),
    {
      kind: 'terminal',
      steps: [
        {
          cmd: 'datacontract lint orders_v1.odcs.yaml',
          out: brokenLint,
          hold: 6000,
          caption: { en: 'Break the lint on purpose: logicalType text is not ODCS. This is what the run reports.', de: 'Brich den Lint absichtlich: logicalType text gibt es in ODCS nicht. Das meldet der Lauf.' },
        },
        {
          cmd: 'datacontract test sku_sales_per_year.odcs.yaml',
          out: brokenTest,
          hold: 6500,
          caption: { en: 'Break a type: the test against the database finds bigint, not integer.', de: 'Brich einen Typ: Der Test gegen die Datenbank findet bigint statt integer.' },
        },
      ],
    },
    {
      kind: 'image',
      src: shot('ci-run-overview.webp'),
      duration: 7500,
      caption: { en: 'Push: GitHub Actions runs the workflow on every change to main.', de: 'Push: GitHub Actions führt den Workflow bei jeder Änderung auf main aus.' },
    },
    {
      kind: 'image',
      src: shot('ci-step-summary.webp'),
      duration: 8500,
      caption: { en: 'datacontract ci writes a step summary: every contract, every check.', de: 'datacontract ci schreibt eine Step Summary: jeder Kontrakt, jeder Check.' },
    },
    {
      kind: 'terminal',
      steps: [
        {
          ...c('breaking-local', 'orders_v1.odcs.yaml orders_v2.odcs.yaml'),
          hold: 7000,
          caption: { en: 'Before the third check, try datacontract breaking locally. v1 to v2 adds a field: no error.', de: 'Vor dem dritten Check: datacontract breaking lokal. v1 zu v2 fügt ein Feld hinzu: kein Fehler.' },
        },
        {
          ...c('breaking-local', 'orders_v2.odcs.yaml orders_v1.odcs.yaml'),
          hold: 7500,
          caption: { en: 'The other way round removes quantity: ERROR and exit code 1.', de: 'Umgekehrt fällt quantity weg: ERROR und Exit-Code 1.' },
        },
      ],
    },
    codeScene({
      file: FILE,
      prefix: `${lint}\n${tests}`,
      code: breaking,
      lineMs: 200,
      caption: { en: 'On pull requests, compare every contract with its version on the base branch.', de: 'Bei Pull Requests: Vergleiche jeden Kontrakt mit seiner Version auf dem Base-Branch.' },
      after: { en: 'A breaking change makes the job fail.', de: 'Ein Breaking Change lässt den Job fehlschlagen.' },
      hold: 5000,
    }),
    {
      kind: 'terminal',
      steps: [
        {
          ...c('breaking-pr', 'git switch'),
          hold: 5500,
          caption: { en: 'Try it: remove customer_id on a branch, push it, and open a pull request in your fork.', de: 'Probier es aus: Entferne customer_id auf einem Branch, pushe und öffne einen Pull Request in deinem Fork.' },
        },
      ],
    },
    {
      kind: 'image',
      src: shot('ci-pr-checks.webp'),
      duration: 8000,
      caption: { en: 'The Breaking changes check fails. Lint and test still pass.', de: 'Der Check Breaking changes schlägt fehl. Lint and test bleibt grün.' },
    },
    {
      kind: 'image',
      src: shot('ci-breaking-log.webp'),
      duration: 8000,
      caption: { en: 'The log says why: customer_id was removed. That would break consumers.', de: 'Das Log sagt, warum: customer_id wurde entfernt. Das würde Konsumenten brechen.' },
    },
    {
      kind: 'card',
      eyebrow: 'Do it right',
      title: 'Add, don’t remove. Or release a new major version.',
      subtitle: 'Compatible changes pass. Breaking ones need orders_v3 and a migration.',
      duration: 7500,
      caption: { en: 'Make a compatible change instead, or release a new major version. Tip: require the check with branch protection.', de: 'Ändere stattdessen kompatibel oder veröffentliche eine neue Major-Version. Tipp: Mach den Check per Branch Protection verpflichtend.' },
    },
  ],
}
