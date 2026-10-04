import { useChapter } from './ChapterContext'

type Focus = 'all' | 'a' | 'b' | 'consumer'

const text = {
  en: {
    orders: 'Orders',
    ordersTeam: 'Order Data Team',
    skuSales: 'SKU Sales',
    skuTeam: 'Purchasing Analytics Team',
    purchasing: 'Purchasing team',
    purchasingNote: 'negotiates with suppliers',
    dataProduct: 'Data product',
    outputPort: 'Output port',
    inputPort: 'Input port',
    contract: 'contract',
    view: 'SQL view',
    tables: 'PostgreSQL tables',
    consumes: 'consumes',
    partA: 'Part A',
    partB: 'Part B',
  },
  de: {
    orders: 'Orders',
    ordersTeam: 'Order Data Team',
    skuSales: 'SKU Sales',
    skuTeam: 'Purchasing Analytics Team',
    purchasing: 'Einkaufsteam',
    purchasingNote: 'verhandelt mit Lieferanten',
    dataProduct: 'Datenprodukt',
    outputPort: 'Output-Port',
    inputPort: 'Input-Port',
    contract: 'Kontrakt',
    view: 'SQL-View',
    tables: 'PostgreSQL-Tabellen',
    consumes: 'konsumiert',
    partA: 'Teil A',
    partB: 'Teil B',
  },
}

function Port({ name, kind, contract, dim }: { name: string; kind: string; contract: string; dim?: boolean }) {
  return (
    <div className={`rounded-lg border border-brand-200 bg-white px-3 py-2 dark:border-brand-900 dark:bg-slate-900 ${dim ? 'opacity-50' : ''}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{kind}</div>
      <div className="font-mono text-xs font-medium text-slate-800 dark:text-slate-100">{name}</div>
      <div className="mt-1 inline-flex items-center gap-1 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-200">
        ODCS {contract}
      </div>
    </div>
  )
}

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center gap-1 py-2 text-slate-400 md:px-2 md:py-0">
      {label && <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>}
      <svg width="40" height="16" viewBox="0 0 40 16" className="rotate-90 md:rotate-0" aria-hidden="true">
        <path d="M0 8h34M28 2l7 6-7 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// The workshop scenario at a glance: the Orders source data product, and the SKU Sales product built on top
export function ScenarioDiagram({ focus = 'all' }: { focus?: Focus }) {
  const { lang } = useChapter()
  const s = text[lang]
  const highlightA = focus === 'all' || focus === 'a'
  const highlightB = focus === 'all' || focus === 'b' || focus === 'consumer'

  const product = (active: boolean) =>
    `flex-1 rounded-2xl border-2 p-4 transition ${
      active ? 'border-brand-400 bg-brand-50/50 dark:border-brand-600 dark:bg-brand-950/30' : 'border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-900/50'
    }`

  return (
    <figure className="not-prose my-8">
      <div className="flex flex-col items-stretch md:flex-row">
        <div className={product(highlightA)}>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">{s.dataProduct} · ODPS</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{s.partA}</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">{s.orders}</div>
          <div className="mb-3 text-xs text-slate-500">{s.ordersTeam} · {s.tables}</div>
          <div className="grid grid-cols-2 gap-2">
            <Port name="orders_v1" kind={s.outputPort} contract="orders_v1" dim />
            <Port name="orders_v2" kind={s.outputPort} contract="orders_v2" />
          </div>
        </div>
        <Arrow label={s.consumes} />
        <div className={product(highlightB)}>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">{s.dataProduct} · ODPS</span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{s.partB}</span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">{s.skuSales}</div>
          <div className="mb-3 text-xs text-slate-500">{s.skuTeam} · {s.view}</div>
          <div className="grid grid-cols-2 gap-2">
            <Port
              name={focus === 'consumer' ? 'sku_sales_input' : 'orders'}
              kind={s.inputPort}
              contract={focus === 'consumer' ? 'orders_v2_consumer_sku_sales' : 'orders_v2'}
            />
            <Port name="sku_sales_per_year" kind={s.outputPort} contract="sku_sales_per_year" />
          </div>
        </div>
        <Arrow />
        <div className="flex flex-col justify-center rounded-2xl border-2 border-dashed border-slate-300 p-4 text-center md:w-36 dark:border-slate-700">
          <div className="text-2xl" aria-hidden="true">🤝</div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.purchasing}</div>
          <div className="text-xs text-slate-500">{s.purchasingNote}</div>
        </div>
      </div>
    </figure>
  )
}
