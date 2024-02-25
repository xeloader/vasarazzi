import axios from 'axios'
import { JSDOM } from 'jsdom'
import { Language, VasaEvent } from '../constants'

export interface Split {
  name: string
  timestamp: string
  lapTime: string
  diff: string
  minPerKm: string
  kmh: string
  prediction: boolean
}

interface RaceOpts {
  lang: Language
}

export async function getSplits (
  personId: string,
  event: VasaEvent,
  opts: Partial<RaceOpts> = {}
): Promise<Split[]> {
  const result = await axios.get('https://results.vasaloppet.se/2024/', {
    params: {
      content: 'detail',
      idp: personId,
      lang: opts.lang ?? Language.English,
      event,
      search_event: ''
    }
  })
  const dom = new JSDOM(result.data)
  return parseSplits(dom)
}

export function parseSplits(dom: JSDOM): Split[] {
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

export async function getPerson (
  personId: string, 
  event: VasaEvent
): Promise<{
  firstname: string
  lastname: string
}> {
  const result = await axios.get('https://results.vasaloppet.se/2024/', {
    params: {
      content: 'detail',
      idp: personId,
      lang: Language.English,
      event,
      search_event: ''
    }
  })
  const dom = new JSDOM(result.data)
  const name = dom.window.document
    .querySelector('.f-__fullname')
    ?.querySelector?.('td')
    ?.textContent
  const parts = name
    ?.split(',')
    ?.map((part) => part.split('(').at(0)?.trim())
  return {
    firstname: parts?.[1] ?? 'Undefined Firstname',
    lastname: parts?.[0] ?? 'Undefined Lastname'
  }
  
}