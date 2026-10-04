import { command, commands } from '../lib/mdx.mjs'
import { codeScene } from '../lib/helpers-b.mjs'

const c = (step, includes) => command('data-product', step, includes)
const lint = commands('data-product').filter((x) => x.step === 'lint')

export default {
  scenes: [
    {
      kind: 'card',
      eyebrow: 'Exercise 3',
      title: 'Describe Your Data Product',
      subtitle: 'Describe the data product behind the contracts with ODPS 1.1.',
      caption: { en: 'Exercise 3: describe your data product.', de: 'Übung 3: Datenprodukt beschreiben.' },
    },
    {
      kind: 'card',
      eyebrow: 'Concept',
      title: 'One data product, many contracts',
      subtitle: 'The product is the stable unit of ownership. It offers its data through output ports, each described by a data contract.',
      duration: 6500,
      caption: { en: 'Orders is one data product. It offers two contract versions as output ports.', de: 'Orders ist ein Datenprodukt. Es bietet zwei Kontrakt-Versionen als Output-Ports an.' },
    },
    {
      kind: 'terminal',
      steps: [
        { ...c('create', 'dataproduct init'), hold: 4500, caption: { en: 'The Data Product CLI creates a starter file. Open it in your IDE.', de: 'Die Data Product CLI legt eine Startdatei an. Öffne sie in deiner IDE.' } },
      ],
    },
    codeScene({
      file: 'orders.odps.yaml',
      charMs: 38,
  endHold: 3500,
  parts: [
        {
          caption: { en: 'One data product, Orders. ODPS 1.1 adds the type: sourceAligned.', de: 'Ein Datenprodukt, Orders. ODPS 1.1 ergänzt den Typ: sourceAligned.' },
          text: `apiVersion: v1.1.0
kind: DataProduct
id: orders
name: Orders
version: 1.0.0
status: active
type: sourceAligned
domain: ecommerce
`,
          hold: 4000,
        },
        {
          caption: { en: 'Purpose and limitations: what consumers need to know first.', de: 'Zweck und Einschränkungen: was Konsumenten zuerst wissen müssen.' },
          text: `description:
  purpose: Orders and line items from the e-commerce platform.
  limitations: Contains PII (customer email addresses).
`,
          charMs: 30,
          hold: 3800,
        },
        {
          caption: { en: 'One output port per contract version. The old v1 port is deprecated.', de: 'Ein Output-Port pro Kontrakt-Version. Der alte v1-Port ist deprecated.' },
          text: `# contractId must match the id of the data contract
outputPorts:
  - name: orders_v1
    deprecated: true
    version: 1.0.0
    contractId: orders_v1
  - name: orders_v2
    version: 2.0.0
    contractId: orders_v2
`,
          hold: 4500,
        },
        {
          caption: { en: 'Tags help consumers find the product in a catalog.', de: 'Tags helfen Konsumenten, das Produkt in einem Katalog zu finden.' },
          text: `tags: ['orders', 'ecommerce']
`,
          hold: 3800,
        },
        {
          caption: { en: 'Team and support, reused from the contracts.', de: 'Team und Support, übernommen aus den Kontrakten.' },
          text: `team:
  name: order_data_team
support:
  - channel: "#order-data-help"
    tool: slack
`,
          hold: 3800,
        },
      ],
    }),
    {
      kind: 'terminal',
      steps: [
        { ...lint[0], hold: 5500, caption: { en: 'Validate against the official ODPS JSON schema.', de: 'Validiere gegen das offizielle ODPS-JSON-Schema.' } },
        { ...lint[1], hold: 7500, caption: { en: 'A typo in kind: the CLI names the wrong field and exits with code 1.', de: 'Ein Tippfehler in kind: Die CLI nennt das falsche Feld und endet mit Exit-Code 1.' } },
      ],
    },
    {
      kind: 'card',
      eyebrow: 'Next',
      title: 'Build a consumer-aligned data product on top',
      subtitle: 'Part B: design SKU Sales contract-first, on top of orders_v2.',
      duration: 4500,
      caption: { en: 'Next: a consumer-aligned data product on top of Orders.', de: 'Als Nächstes: ein consumer-aligned Datenprodukt auf Basis von Orders.' },
    },
  ],
}
