import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { Lang } from './i18n'

export const REPO_URL = 'https://github.com/datacontract/learn.datacontract.com'

type Localized = Record<Lang, string>

export type Part = { id: string; title: Localized; optional?: boolean }

export type Chapter = {
  slug: string
  part: string
  /** exercises are numbered, intro and outro chapters are not */
  exercise: boolean
  minutes: number
  title: Localized
  summary: Localized
}

export const parts: Part[] = [
  { id: 'start', title: { en: 'Getting Started', de: 'Los geht’s' } },
  { id: 'a', title: { en: 'Part A · The Source Data Product', de: 'Teil A · Das Quell-Datenprodukt' } },
  { id: 'b', title: { en: 'Part B · The Consumer-Aligned Data Product', de: 'Teil B · Das Consumer-Aligned Data Product' } },
  { id: 'c', title: { en: 'Part C · Automate', de: 'Teil C · Automatisieren' } },
  { id: 'd', title: { en: 'Part D · Data Platform', de: 'Teil D · Datenplattform' }, optional: true },
  { id: 'end', title: { en: 'Wrap-up', de: 'Abschluss' } },
]

export const chapters: Chapter[] = [
  {
    slug: 'welcome',
    part: 'start',
    exercise: false,
    minutes: 15,
    title: { en: 'Welcome', de: 'Willkommen' },
    summary: {
      en: 'Why data contracts? ODCS, ODPS, and what you will build.',
      de: 'Warum Datenkontrakte? ODCS, ODPS und was du bauen wirst.',
    },
  },
  {
    slug: 'setup',
    part: 'start',
    exercise: false,
    minutes: 20,
    title: { en: 'Setup', de: 'Setup' },
    summary: {
      en: 'Fork the repository, install the CLIs, and start the database.',
      de: 'Repository forken, CLIs installieren und Datenbank starten.',
    },
  },
  {
    slug: 'contract',
    part: 'a',
    exercise: true,
    minutes: 60,
    title: { en: 'Put Your Data Under Contract', de: 'Daten unter Vertrag nehmen' },
    summary: {
      en: 'Write your first ODCS data contract and test it against PostgreSQL.',
      de: 'Schreibe deinen ersten ODCS-Datenkontrakt und teste ihn gegen PostgreSQL.',
    },
  },
  {
    slug: 'evolution',
    part: 'a',
    exercise: true,
    minutes: 30,
    title: { en: 'Data Contract Evolution', de: 'Evolution von Datenkontrakten' },
    summary: {
      en: 'Release a breaking change as a new major version and migrate.',
      de: 'Einen Breaking Change als neue Major-Version veröffentlichen und migrieren.',
    },
  },
  {
    slug: 'data-product',
    part: 'a',
    exercise: true,
    minutes: 20,
    title: { en: 'Describe Your Data Product', de: 'Datenprodukt beschreiben' },
    summary: {
      en: 'Describe the data product behind the contracts with ODPS.',
      de: 'Das Datenprodukt hinter den Kontrakten mit ODPS beschreiben.',
    },
  },
  {
    slug: 'contract-first',
    part: 'b',
    exercise: true,
    minutes: 30,
    title: { en: 'Design Contract-First', de: 'Contract-first entwerfen' },
    summary: {
      en: 'Design a derived data product before writing a single line of SQL.',
      de: 'Ein abgeleitetes Datenprodukt entwerfen, bevor du eine Zeile SQL schreibst.',
    },
  },
  {
    slug: 'implement',
    part: 'b',
    exercise: true,
    minutes: 25,
    title: { en: 'Implement Your Data Product', de: 'Datenprodukt implementieren' },
    summary: {
      en: 'Turn red tests green, with an AI coding agent or by hand.',
      de: 'Rote Tests grün machen, mit einem KI-Coding-Agenten oder von Hand.',
    },
  },
  {
    slug: 'consumer-driven',
    part: 'b',
    exercise: true,
    minutes: 30,
    title: { en: 'Consumer-Driven Contracts', de: 'Consumer-driven Contracts' },
    summary: {
      en: 'Make your dependencies explicit with a consumer-driven contract.',
      de: 'Abhängigkeiten mit einem Consumer-driven Contract explizit machen.',
    },
  },
  {
    slug: 'ci-cd',
    part: 'c',
    exercise: true,
    minutes: 45,
    title: { en: 'CI/CD with GitHub Actions', de: 'CI/CD mit GitHub Actions' },
    summary: {
      en: 'Test every change automatically and block breaking changes in pull requests.',
      de: 'Jede Änderung automatisch testen und Breaking Changes im Pull Request stoppen.',
    },
  },
  {
    slug: 'publish',
    part: 'd',
    exercise: true,
    minutes: 40,
    title: { en: 'Publish to Entropy Data', de: 'Auf Entropy Data veröffentlichen' },
    summary: {
      en: 'Make your data products discoverable on a data product platform.',
      de: 'Deine Datenprodukte auf einer Datenproduktplattform auffindbar machen.',
    },
  },
  {
    slug: 'semantics',
    part: 'd',
    exercise: true,
    minutes: 25,
    title: { en: 'Semantics', de: 'Semantik' },
    summary: {
      en: 'Define business concepts once and link your contracts to them.',
      de: 'Fachliche Begriffe einmal definieren und deine Kontrakte damit verknüpfen.',
    },
  },
  {
    slug: 'wrap-up',
    part: 'end',
    exercise: false,
    minutes: 10,
    title: { en: 'Wrap-up', de: 'Abschluss' },
    summary: {
      en: 'Look back at what you built and where to go from here.',
      de: 'Rückblick auf das Gebaute und wie es weitergeht.',
    },
  },
]

export function exerciseNumber(slug: string): number | undefined {
  const index = chapters.filter((c) => c.exercise).findIndex((c) => c.slug === slug)
  return index >= 0 ? index + 1 : undefined
}

import stepsManifest from 'virtual:steps'

type ContentModule = { default: ComponentType<{ components?: Record<string, unknown> }> }

// chapters are loaded on demand, each one is its own chunk
const modules = import.meta.glob<ContentModule>('./content/*/*.mdx')

const lazyCache = new Map<string, LazyExoticComponent<ComponentType<{ components?: Record<string, unknown> }>>>()

export function content(lang: Lang, slug: string) {
  const key = `./content/${lang}/${slug}.mdx`
  const loader = modules[key]
  if (!loader) return undefined
  if (!lazyCache.has(key)) lazyCache.set(key, lazy(loader))
  return lazyCache.get(key)!
}

/** step ids of a chapter, taken from the English version; the German one must use the same ids */
export function stepsOf(slug: string): string[] {
  return stepsManifest.en?.[slug] ?? stepsManifest.de?.[slug] ?? []
}
