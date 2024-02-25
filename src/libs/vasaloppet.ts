import { JSDOM } from 'jsdom'

interface Split {
  name: string
  timestamp: string
  lapTime: string
  diff: string
  minPerKm: string
  kmh: string
  prediction: boolean
}

export function getSplits(dom: JSDOM): Split[] {
  const $table = dom.window.document.querySelector('.detail-box.box-splits')
  const $rows = $table?.querySelector?.('tbody')
    ?.querySelectorAll?.('tr')
  if (!$rows) return []
  return [...$rows].map(parseSplit)

}

function parseSplit (row: HTMLTableRowElement): Split {
  const $columns = row.children
  const splitName = $columns[0].textContent
  let split = {
    name: splitName ?? 'Not set',
    timestamp: $columns[1].textContent ?? 'Not set',
    lapTime: $columns[2].textContent ?? 'Not set',
    diff: $columns[3].textContent ?? 'Not set',
    minPerKm: $columns[4].textContent ?? 'Not set',
    kmh: $columns[5].textContent ?? 'Not set',
  }
  return {
    ...split,
    prediction: splitName?.includes('*') ?? true
  }
}