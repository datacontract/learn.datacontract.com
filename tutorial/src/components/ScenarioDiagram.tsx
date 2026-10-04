import { useChapter } from './ChapterContext'

type Focus = 'all' | 'a' | 'b' | 'consumer'

const text = {
  en: {
    sourceAligned: 'Source-aligned data product',
    consumerAligned: 'Consumer-aligned data product',
    consumer: 'Data consumer',
    ordersTeam: 'Order Data Team',
    skuTeam: 'Purchasing Analytics Team',
    purchasing: 'Purchasing team',
    purchasingNote: 'negotiates with suppliers',
    contract: 'contract',
    deprecated: 'deprecated',
    inputOmitted: 'Input ports omitted for simplicity',
    partA: 'Part A',
    partB: 'Part B',
  },
  de: {
    sourceAligned: 'Source-aligned Datenprodukt',
    consumerAligned: 'Consumer-aligned Datenprodukt',
    consumer: 'Data Consumer',
    ordersTeam: 'Order Data Team',
    skuTeam: 'Purchasing Analytics Team',
    purchasing: 'Einkaufsteam',
    purchasingNote: 'verhandelt mit Lieferanten',
    contract: 'Kontrakt',
    deprecated: 'veraltet',
    inputOmitted: 'Input-Ports zur Vereinfachung weggelassen',
    partA: 'Teil A',
    partB: 'Teil B',
  },
}

// A data product card in the style of the Entropy Data map: colored header by type,
// output ports as small handles on the right edge, input port on the left edge.
function Node({ x, y, w, h, header, headerClass, name, team, dim, input }: {
  x: number; y: number; w: number; h: number; header: string; headerClass: string; name: string; team: string; dim?: boolean; input?: number
}) {
  return (
    <g opacity={dim ? 0.4 : 1}>
      <rect x={x} y={y} width={w} height={h} rx={4} className="fill-white stroke-slate-300 dark:fill-slate-900 dark:stroke-slate-600" />
      <path d={`M${x + 4} ${y}h${w - 8}a4 4 0 0 1 4 4v16h-${w}v-16a4 4 0 0 1 4-4z`} className={headerClass} />
      <line x1={x} x2={x + w} y1={y + 20} y2={y + 20} className="stroke-slate-300 dark:stroke-slate-600" />
      <text x={x + 8} y={y + 13.5} className="fill-slate-600 text-[8px] font-semibold uppercase tracking-wide dark:fill-slate-800">{header}</text>
      <text x={x + 8} y={y + 39} className="fill-slate-800 text-[14px] font-bold dark:fill-slate-100">{name}</text>
      <text x={x + 8} y={y + 52} className="fill-slate-500 text-[8.5px] dark:fill-slate-400">{team}</text>
      {input !== undefined && <rect x={x - 5} y={input - 5} width={10} height={10} rx={2} className="fill-slate-200 stroke-slate-400 dark:fill-slate-700 dark:stroke-slate-500" />}
    </g>
  )
}

function OutputPort({ x, y, label, deprecated, dim }: { x: number; y: number; label: string; deprecated?: string; dim?: boolean }) {
  return (
    <g opacity={dim ? 0.4 : 1}>
      <text x={x - 6} y={y + 3} textAnchor="end" className="fill-slate-600 font-mono text-[9px] dark:fill-slate-300">
        {label}
        {deprecated && <tspan className="fill-slate-400 font-sans text-[8px]"> ({deprecated})</tspan>}
      </text>
      <rect x={x - 5} y={y - 5} width={20} height={10} rx={2} fill={deprecated ? 'url(#deprecated-stripes)' : undefined} className={deprecated ? 'stroke-slate-400' : 'fill-slate-200 stroke-slate-400 dark:fill-slate-700 dark:stroke-slate-500'} />
    </g>
  )
}

function Edge({ from, to, label, dim }: { from: [number, number]; to: [number, number]; label?: string; dim?: boolean }) {
  const [x1, y1] = from
  const [x2, y2] = to
  const mid = (x1 + x2) / 2
  return (
    <g opacity={dim ? 0.4 : 1}>
      <path d={`M${x1} ${y1}C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`} fill="none" markerEnd="url(#arrow)" className="stroke-brand-400 dark:stroke-brand-500" strokeWidth={1.5} />
      {label && <text x={x2 + 4} y={Math.max(y1, y2) + 24} className="fill-brand-700 font-mono text-[8px] dark:fill-brand-300">{label}</text>}
    </g>
  )
}

// The workshop scenario at a glance, drawn like the data product map in Entropy Data
export function ScenarioDiagram({ focus = 'all' }: { focus?: Focus }) {
  const { lang } = useChapter()
  const s = text[lang]
  const dimA = !(focus === 'all' || focus === 'a')
  const dimB = !(focus === 'all' || focus === 'b' || focus === 'consumer')
  const consumerDriven = focus === 'consumer'

  return (
    <figure className="not-prose my-8 overflow-x-auto">
      <svg viewBox="0 0 760 175" className="min-w-[620px] w-full" role="img" aria-label="Orders → SKU Sales → Purchasing team">
        <defs>
          <pattern id="deprecated-stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#ffffff" />
            <rect width="3" height="6" fill="#e2e8f0" />
          </pattern>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" className="fill-brand-400 dark:fill-brand-500" />
          </marker>
        </defs>

        <text x={10} y={22} className="fill-slate-400 text-[9px] font-semibold uppercase tracking-wider">{s.partA}</text>
        <text x={300} y={22} className="fill-slate-400 text-[9px] font-semibold uppercase tracking-wider">{s.partB}</text>

        <Node x={10} y={30} w={210} h={110} header={s.sourceAligned} headerClass="fill-blue-200" name="Orders" team={`${s.ordersTeam} · PostgreSQL`} dim={dimA} />
        <OutputPort x={220} y={98} label="orders_v1" deprecated={s.deprecated} dim={dimA} />
        <OutputPort x={220} y={118} label="orders_v2" dim={dimA} />
        <text x={10} y={156} className="fill-slate-400 text-[8px] italic">{s.inputOmitted}</text>

        <Edge from={[235, 118]} to={[295, 108]} label={consumerDriven ? `${s.contract}: orders_v2_consumer_sku_sales` : undefined} dim={dimB} />

        <Node x={300} y={30} w={210} h={110} header={s.consumerAligned} headerClass="fill-cyan-200" name="SKU Sales" team={`${s.skuTeam} · SQL view`} dim={dimB} input={108} />
        <OutputPort x={510} y={108} label="sku_sales_per_year" dim={dimB} />

        <Edge from={[525, 108]} to={[595, 98]} dim={dimB} />

        <Node x={600} y={50} w={150} h={70} header={s.consumer} headerClass="fill-rose-100" name={s.purchasing} team={s.purchasingNote} input={98} />
      </svg>
    </figure>
  )
}
