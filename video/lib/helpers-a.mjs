// Helpers for the setup and contract scenes.

/**
 * Splits a multi-line command block into one terminal step per command line.
 * `outs` assigns outputs to the lines (by index); the caption goes on the first line.
 */
export function split(block, { caption, outs = {}, hold = 2500, lastHold } = {}) {
  const lines = block.cmd.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'))
  return lines.map((cmd, i) => ({
    cmd,
    out: outs[i] ?? (i === 0 && lines.length === 1 ? block.out : ''),
    hold: i === lines.length - 1 ? (lastHold ?? hold) : 900,
    ...(i === 0 && caption ? { caption } : {}),
  }))
}

// Contract states for the editor scenes of the contract chapter, matching the chapter's steps
export const BASE = `apiVersion: v3.2.0
kind: DataContract
id: orders_v1
name: Orders
version: 1.0.0
status: draft
`

export const SERVER = `servers:
  - server: Orders
    type: postgres
    host: localhost
    port: 5433
    database: workshop
    schema: orders_v1
`

const prop = (name, logical, physical) => `      - name: ${name}\n        logicalType: ${logical}\n        physicalType: ${physical}\n`

export const SCHEMA = `schema:
  - name: orders
    physicalType: table
    properties:
${prop('order_id', 'string', 'TEXT')}${prop('order_timestamp', 'date', 'TIMESTAMPTZ')}${prop('order_total', 'integer', 'BIGINT')}${prop('customer_id', 'string', 'TEXT')}${prop('customer_email_address', 'string', 'TEXT')}  - name: line_items
    physicalType: table
    properties:
${prop('lines_item_id', 'string', 'TEXT')}${prop('order_id', 'string', 'TEXT')}${prop('sku', 'string', 'TEXT')}`

/** picks a value in a headless-ui combobox: type to filter, then click the exact option */
export async function choose(page, input, value, { click, type }) {
  await type(page, input, value, { delay: 70 })
  const option = page.getByRole('option', { name: value, exact: true }).first()
  if (await option.count()) await click(page, option, { pause: 400 })
  else await page.keyboard.press('Enter')
}
