import { useChapter } from './ChapterContext'

/** `all` shows the whole scenario; the other variants show what one exercise builds */
type Variant = 'all' | 'contract' | 'evolution' | 'data-product' | 'contract-first' | 'implement' | 'consumer-driven'

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
    new: 'new',
    designed: 'designed',
    inputOmitted: 'Input ports omitted for simplicity',
    partA: 'Part A',
    partB: 'Part B',
    inThis: 'In this exercise:',
    captions: {
      contract: 'the data contract for the output port orders_v1 of the Orders data product.',
      evolution: 'a new major version orders_v2 with the quantity column. orders_v1 is retired.',
      'data-product': 'the Orders data product itself, described with ODPS: ownership, purpose, and its output ports.',
      'contract-first': 'the contract and ODPS description of SKU Sales. Designed first, implemented in the next exercise.',
      implement: 'the SQL view behind SKU Sales, reading from orders_v2, until all contract tests pass.',
      'consumer-driven': 'a consumer-driven contract with just the fields SKU Sales needs from orders_v2.',
    } as Record<string, string>,
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
    new: 'neu',
    designed: 'entworfen',
    inputOmitted: 'Input-Ports zur Vereinfachung weggelassen',
    partA: 'Teil A',
    partB: 'Teil B',
    inThis: 'In dieser Übung:',
    captions: {
      contract: 'der Datenkontrakt für den Output-Port orders_v1 des Datenprodukts Orders.',
      evolution: 'eine neue Major-Version orders_v2 mit der Spalte quantity. orders_v1 geht in Rente.',
      'data-product': 'das Datenprodukt Orders selbst, beschrieben mit ODPS: Ownership, Zweck und Output-Ports.',
      'contract-first': 'Kontrakt und ODPS-Beschreibung von SKU Sales. Zuerst entworfen, in der nächsten Übung implementiert.',
      implement: 'die SQL-View hinter SKU Sales, die aus orders_v2 liest, bis alle Kontrakt-Tests grün sind.',
      'consumer-driven': 'ein Consumer-driven Contract mit genau den Feldern, die SKU Sales aus orders_v2 braucht.',
    } as Record<string, string>,
  },
}

// how an element appears in a variant: hidden, faded (comes later), normal (exists),
// highlight (built in this exercise), or planned (designed, not implemented yet)
type Look = 'hidden' | 'faded' | 'normal' | 'highlight' | 'planned'

type Config = { orders: Look; v1: Look; v1Deprecated: boolean; v2: Look; sku: Look; skuPort: Look; edge: Look; consumer: Look; consumerEdge: Look }

const CONFIGS: Record<Variant, Config> = {
  all: { orders: 'normal', v1: 'normal', v1Deprecated: true, v2: 'normal', sku: 'normal', skuPort: 'normal', edge: 'normal', consumer: 'normal', consumerEdge: 'normal' },
  contract: { orders: 'normal', v1: 'highlight', v1Deprecated: false, v2: 'hidden', sku: 'faded', skuPort: 'faded', edge: 'hidden', consumer: 'faded', consumerEdge: 'hidden' },
  evolution: { orders: 'normal', v1: 'normal', v1Deprecated: true, v2: 'highlight', sku: 'faded', skuPort: 'faded', edge: 'hidden', consumer: 'faded', consumerEdge: 'hidden' },
  'data-product': { orders: 'highlight', v1: 'normal', v1Deprecated: true, v2: 'normal', sku: 'faded', skuPort: 'faded', edge: 'hidden', consumer: 'faded', consumerEdge: 'hidden' },
  'contract-first': { orders: 'normal', v1: 'normal', v1Deprecated: true, v2: 'normal', sku: 'planned', skuPort: 'planned', edge: 'planned', consumer: 'faded', consumerEdge: 'planned' },
  implement: { orders: 'normal', v1: 'normal', v1Deprecated: true, v2: 'normal', sku: 'highlight', skuPort: 'normal', edge: 'highlight', consumer: 'normal', consumerEdge: 'normal' },
  'consumer-driven': { orders: 'normal', v1: 'normal', v1Deprecated: true, v2: 'normal', sku: 'normal', skuPort: 'normal', edge: 'highlight', consumer: 'normal', consumerEdge: 'normal' },
}

const opacity = (look: Look) => (look === 'faded' ? 0.3 : 1)
const dash = (look: Look) => (look === 'planned' ? '4 3' : undefined)

// A data product card in the style of the Entropy Data map: colored header by type,
// output ports as small handles on the right edge, input port on the left edge.
function Node({ x, y, w, h, header, headerClass, name, team, look, input }: {
  x: number; y: number; w: number; h: number; header: string; headerClass: string; name: string; team: string; look: Look; input?: number
}) {
  if (look === 'hidden') return null
  return (
    <g opacity={opacity(look)}>
      {look === 'highlight' && <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx={7} className="fill-brand-100/60 stroke-brand-400 dark:fill-brand-900/40 dark:stroke-brand-500" strokeWidth={1.5} />}
      <rect x={x} y={y} width={w} height={h} rx={4} strokeDasharray={dash(look)} className="fill-white stroke-slate-300 dark:fill-slate-900 dark:stroke-slate-600" />
      <path d={`M${x + 4} ${y}h${w - 8}a4 4 0 0 1 4 4v16h-${w}v-16a4 4 0 0 1 4-4z`} className={headerClass} opacity={look === 'planned' ? 0.55 : 1} />
      <line x1={x} x2={x + w} y1={y + 20} y2={y + 20} className="stroke-slate-300 dark:stroke-slate-600" />
      <text x={x + 8} y={y + 13.5} className="fill-slate-600 text-[8px] font-semibold uppercase tracking-wide dark:fill-slate-800">{header}</text>
      <text x={x + 8} y={y + 39} className="fill-slate-800 text-[14px] font-bold dark:fill-slate-100">{name}</text>
      <text x={x + 8} y={y + 52} className="fill-slate-500 text-[8.5px] dark:fill-slate-400">{team}</text>
      {input !== undefined && <rect x={x - 5} y={input - 5} width={10} height={10} rx={2} strokeDasharray={dash(look)} className="fill-slate-200 stroke-slate-400 dark:fill-slate-700 dark:stroke-slate-500" />}
    </g>
  )
}

function OutputPort({ x, y, label, look, note, deprecated }: { x: number; y: number; label: string; look: Look; note?: string; deprecated?: boolean }) {
  if (look === 'hidden') return null
  const highlight = look === 'highlight'
  return (
    <g opacity={opacity(look)}>
      <text x={x - 6} y={y + 3} textAnchor="end" className={`font-mono text-[9px] ${highlight ? 'fill-brand-700 font-semibold dark:fill-brand-300' : 'fill-slate-600 dark:fill-slate-300'}`}>
        {label}
        {note && <tspan className="fill-slate-400 font-sans text-[8px] font-normal"> ({note})</tspan>}
      </text>
      <rect
        x={x - 5}
        y={y - 5}
        width={20}
        height={10}
        rx={2}
        strokeDasharray={dash(look)}
        strokeWidth={highlight ? 1.5 : 1}
        fill={deprecated ? 'url(#deprecated-stripes)' : undefined}
        className={highlight ? 'fill-brand-200 stroke-brand-500' : deprecated ? 'stroke-slate-400' : 'fill-slate-200 stroke-slate-400 dark:fill-slate-700 dark:stroke-slate-500'}
      />
    </g>
  )
}

// arrows point from the consumer to the provider (the dependency), like on the Entropy Data map
function Edge({ from, to, label, look }: { from: [number, number]; to: [number, number]; label?: string; look: Look }) {
  if (look === 'hidden') return null
  const [x1, y1] = from
  const [x2, y2] = to
  const mid = (x1 + x2) / 2
  const highlight = look === 'highlight'
  return (
    <g opacity={opacity(look)}>
      <path
        d={`M${x1} ${y1}C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`}
        fill="none"
        markerStart="url(#arrow)"
        strokeDasharray={dash(look)}
        strokeWidth={highlight ? 2.5 : 1.5}
        className={highlight ? 'stroke-brand-600 dark:stroke-brand-400' : 'stroke-brand-400 dark:stroke-brand-500'}
      />
      {label && <text x={x1 + 8} y={160} className="fill-brand-700 font-mono text-[8px] font-semibold dark:fill-brand-300">{label}</text>}
    </g>
  )
}

// The workshop scenario drawn like the data product map in Entropy Data
export function ScenarioDiagram({ variant = 'all' }: { variant?: Variant }) {
  const { lang } = useChapter()
  const s = text[lang]
  const c = CONFIGS[variant]

  return (
    <figure className="not-prose my-8">
      <div className="overflow-x-auto">
        <svg viewBox="0 0 760 175" className="w-full min-w-[620px]" role="img" aria-label="Orders → SKU Sales → Purchasing team">
          <defs>
            <pattern id="deprecated-stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="#ffffff" />
              <rect width="3" height="6" fill="#e2e8f0" />
            </pattern>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" className="fill-brand-500" />
            </marker>
          </defs>

          <text x={10} y={22} className="fill-slate-400 text-[9px] font-semibold uppercase tracking-wider">{s.partA}</text>
          <text x={300} y={22} opacity={opacity(c.sku)} className="fill-slate-400 text-[9px] font-semibold uppercase tracking-wider">{s.partB}</text>

          <Node x={10} y={30} w={210} h={110} header={s.sourceAligned} headerClass="fill-blue-200" name="Orders" team={`${s.ordersTeam} · PostgreSQL`} look={c.orders} />
          <OutputPort x={220} y={98} label="orders_v1" note={c.v1Deprecated ? s.deprecated : undefined} deprecated={c.v1Deprecated} look={c.v1} />
          <OutputPort x={220} y={118} label="orders_v2" note={variant === 'evolution' ? s.new : undefined} look={c.v2} />
          <text x={10} y={160} className="fill-slate-400 text-[8px] italic">{s.inputOmitted}</text>

          <Edge from={[235, 118]} to={[295, 108]} label={variant === 'consumer-driven' ? `${s.contract}: orders_v2_consumer_sku_sales` : undefined} look={c.edge} />

          <Node x={300} y={30} w={210} h={110} header={s.consumerAligned} headerClass="fill-cyan-200" name="SKU Sales" team={`${s.skuTeam} · SQL view`} look={c.sku} input={108} />
          <OutputPort x={510} y={108} label="sku_sales_per_year" note={c.skuPort === 'planned' ? s.designed : undefined} look={c.skuPort} />

          <Edge from={[525, 108]} to={[595, 98]} look={c.consumerEdge} />

          <Node x={600} y={50} w={150} h={70} header={s.consumer} headerClass="fill-rose-100" name={s.purchasing} team={s.purchasingNote} look={c.consumer} input={98} />
        </svg>
      </div>
      {variant !== 'all' && (
        <figcaption className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-brand-600 dark:text-brand-300">{s.inThis}</span> {s.captions[variant]}
        </figcaption>
      )}
    </figure>
  )
}
