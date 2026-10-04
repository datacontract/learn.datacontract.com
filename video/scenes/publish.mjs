// Walkthrough of the "Publish to Entropy Data" chapter, recorded against the local
// Community Edition (http://localhost:8081, organization acme). The CE must be running and
// contain the published teams, contracts, products, access agreement, and test results.
import { commands } from '../lib/mdx.mjs'
import { click, moveTo } from '../lib/browser.mjs'
import { CE, local, login, scroll, settle } from '../lib/helpers-d.mjs'

const all = commands('publish')
const cmd = (step, includes = '') => {
  const found = all.find((c) => c.step === step && c.cmd.includes(includes))
  if (!found) throw new Error(`no command ${step} ${includes}`)
  return { cmd: found.cmd, out: local(found.out) }
}
// the chapter shows the cloud variant's output for the test results, the video uses the CE
const testResults = {
  cmd: cmd('test-results', 'localhost').cmd,
  out: cmd('test-results', 'api.entropy-data.com').out,
}

const explore = {
  kind: 'browser',
  async run({ page, cue, sleep, start }) {
    await login(page)
    await page.goto(`${CE}/acme/dataproducts`)
    await settle(page, 300)
    start()
    cue({ en: 'In the platform, other teams can now find your data products.', de: 'Auf der Plattform finden andere Teams jetzt deine Datenprodukte.' })
    await sleep(3500)
    await click(page, page.getByRole('link', { name: 'Orders', exact: true }).first())
    await settle(page)
    cue({ en: 'Orders: owner, purpose, tags, and support channel, straight from your ODPS file.', de: 'Orders: Owner, Zweck, Tags und Support-Kanal, direkt aus deiner ODPS-Datei.' })
    await sleep(3500)
    await scroll(page, 900, { ms: 1400 })
    cue({ en: 'The orders_v2 port: tests passed, one consumer. The retired v1 port is hidden.', de: 'Der Port orders_v2: Tests grün, ein Konsument. Der stillgelegte Port v1 ist ausgeblendet.' })
    await moveTo(page, page.getByText('1 consumer').first())
    await sleep(4500)
    await click(page, page.getByRole('link', { name: 'Data Products' }).first())
    await settle(page, 800)
    cue({ en: 'Open SKU Sales. The access agreement shows up as a link to Orders.', de: 'Öffne SKU Sales. Die Zugriffsvereinbarung erscheint als Verbindung zu Orders.' })
    await click(page, page.getByRole('link', { name: 'SKU Sales', exact: true }).first())
    await settle(page)
    await moveTo(page, page.getByText('Orders', { exact: true }).first())
    await sleep(4000)
    cue({ en: 'Further down: purpose, owner, and the output port with its data contract.', de: 'Weiter unten: Zweck, Owner und der Output-Port mit seinem Datenkontrakt.' })
    await scroll(page, 520, { ms: 1200 })
    await sleep(3500)
    await click(page, page.getByRole('link', { name: 'sku_sales_per_year' }).last())
    await settle(page)
    cue({ en: 'The contract page: schema, terms of use, and owner.', de: 'Die Kontraktseite: Schema, Nutzungsbedingungen und Owner.' })
    await sleep(4000)
    await scroll(page, 480, { ms: 1200 })
    await sleep(1000)
    cue({ en: 'Data Quality shows the test results you published.', de: 'Unter Data Quality stehen die veröffentlichten Testergebnisse.' })
    const quality = page.getByRole('link', { name: /Passed \d+ checks/ }).first()
    await moveTo(page, quality)
    await sleep(2500)
    await click(page, quality)
    await settle(page)
    cue({ en: 'Every check of the last run, with its result.', de: 'Jeder Check des letzten Laufs, mit seinem Ergebnis.' })
    await sleep(3000)
    await scroll(page, 400, { ms: 1500 })
    await sleep(3500)
  },
}

export default {
  scenes: [
    {
      kind: 'card',
      eyebrow: 'Exercise 8 · optional',
      title: 'Publish to Entropy Data',
      subtitle: 'Make your data products discoverable on a data product platform.',
      caption: { en: 'Exercise 8: publish everything to Entropy Data.', de: 'Übung 8: alles auf Entropy Data veröffentlichen.' },
    },
    {
      kind: 'terminal',
      steps: [
        { ...cmd('access'), hold: 5000, caption: { en: 'No cloud account? Run the Community Edition locally. The setup script creates account, organization, and API key.', de: 'Kein Cloud-Konto? Starte die Community Edition lokal. Das Setup-Skript legt Konto, Organisation und API Key an.' } },
        { ...cmd('connect', 'connection test'), hold: 3000, caption: { en: 'Check that the Entropy Data CLI can connect.', de: 'Prüfe, ob die Entropy Data CLI verbindet.' } },
      ],
    },
    {
      kind: 'terminal',
      steps: [
        { ...cmd('teams'), hold: 6000, caption: { en: 'Create the owning teams first. Contracts and products reference them.', de: 'Lege zuerst die Teams an. Kontrakte und Produkte verweisen auf sie.' } },
      ],
    },
    {
      kind: 'terminal',
      steps: [
        { ...cmd('contracts'), hold: 6500, caption: { en: 'Publish your four data contracts.', de: 'Veröffentliche deine vier Datenkontrakte.' } },
      ],
    },
    {
      kind: 'terminal',
      steps: [
        { ...cmd('products', 'entropy-data dataproducts put'), hold: 5000, caption: { en: 'Publish both data products. Entropy Data reads ODPS natively.', de: 'Veröffentliche beide Datenprodukte. Entropy Data liest ODPS direkt.' } },
        { ...cmd('agreement'), hold: 4000, caption: { en: 'Connect them: SKU Sales consumes the orders_v2 port of Orders.', de: 'Verbinde sie: SKU Sales konsumiert den Port orders_v2 von Orders.' } },
      ],
    },
    {
      kind: 'terminal',
      steps: [
        { ...testResults, hold: 6000, caption: { en: 'Run the tests again and publish the results to the platform.', de: 'Führe die Tests erneut aus und veröffentliche die Ergebnisse auf der Plattform.' } },
      ],
    },
    explore,
  ],
}
