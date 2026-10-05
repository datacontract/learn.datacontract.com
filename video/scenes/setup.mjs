import { command, commands } from '../lib/mdx.mjs'
import { moveTo, showCursor } from '../lib/browser.mjs'
import { split } from '../lib/helpers-a.mjs'

const c = (step, includes) => command('setup', step, includes)
const all = (step) => commands('setup').filter((x) => x.step === step)

// the public repository page on GitHub, pointing at the Fork button (no login needed to show it)
const fork = {
  kind: 'browser',
  async run({ page, cue, sleep, start }) {
    await page.goto('https://github.com/datacontract/learn.datacontract.com', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2500)
    // hide cookie banners or sign-up prompts that might cover the page
    await page.addStyleTag({ content: '.js-cookie-consent-banner, cookie-consent-banner { display: none !important; }' })
    await showCursor(page)
    start()
    cue({ en: 'Open the workshop repository on GitHub and click Fork.', de: 'Öffne das Workshop-Repository auf GitHub und klicke auf Fork.' })
    await sleep(2500)
    const forkButton = page.locator('#fork-button, a[href$="/fork"]').first()
    await moveTo(page, forkButton)
    await sleep(2500)
    cue({ en: 'Your fork is your own copy. You will push to it in the CI/CD chapter.', de: 'Dein Fork ist deine eigene Kopie. Im CI/CD-Kapitel pushst du dorthin.' })
    await sleep(4500)
  },
}

export default {
  scenes: [
    {
      kind: 'card',
      eyebrow: 'Getting Started',
      title: 'Setup',
      subtitle: 'Fork the repository, install the CLIs, and start the database.',
      caption: { en: 'Setup: everything you need for the exercises.', de: 'Setup: alles, was du für die Übungen brauchst.' },
    },
    {
      kind: 'terminal',
      steps: [
        ...split(all('prerequisites')[1], {
          outs: Object.fromEntries(all('prerequisites')[1].out.split('\n').map((l, i) => [i, l])),
          lastHold: 3500,
          caption: { en: 'Check the prerequisites: git, Docker with Compose, and uv.', de: 'Prüfe die Voraussetzungen: git, Docker mit Compose und uv.' },
        }),
      ],
    },
    fork,
    {
      kind: 'terminal',
      steps: [
        ...split(c('clone', 'git clone'), { outs: { 0: c('clone', 'git clone').out }, lastHold: 2500, caption: { en: 'Clone your fork and change into the folder.', de: 'Klone deinen Fork und wechsle in den Ordner.' } }),
        { ...c('install', 'install'), hold: 5000, caption: { en: 'The install script installs the Data Contract CLI and the Data Product CLI.', de: 'Das Install-Skript installiert die Data Contract CLI und die Data Product CLI.' } },
        ...split(c('verify-cli', 'datacontract --version'), { outs: { 0: '1.2.3', 1: '0.2.0' }, lastHold: 3500, caption: { en: 'Check the versions: 1.2.3 and 0.2.0.', de: 'Prüfe die Versionen: 1.2.3 und 0.2.0.' } }),
      ],
    },
    {
      kind: 'terminal',
      steps: [
        { ...c('database', 'docker compose up'), hold: 3500, caption: { en: 'Start PostgreSQL. It comes preloaded with the orders data.', de: 'Starte PostgreSQL. Die Orders-Daten sind schon geladen.' } },
        { ...c('database', 'SELECT COUNT'), hold: 4000, caption: { en: 'A quick query shows 5000 orders.', de: 'Eine kurze Abfrage zeigt 5000 Bestellungen.' } },
        {
          cmd: 'grep POSTGRES .env',
          out: 'DATACONTRACT_POSTGRES_USERNAME=workshop\nDATACONTRACT_POSTGRES_PASSWORD=workshop',
          hold: 5000,
          caption: { en: 'The .env file holds the database credentials. The CLIs read it automatically.', de: 'Die Datei .env enthält die Zugangsdaten. Die CLIs lesen sie automatisch.' },
        },
      ],
    },
    {
      kind: 'card',
      eyebrow: 'Ready',
      title: 'You are all set',
      subtitle: 'Next: put your data under contract.',
      duration: 3000,
      caption: { en: 'Done. Next: put your data under contract.', de: 'Fertig. Als Nächstes: Daten unter Vertrag nehmen.' },
    },
  ],
}
