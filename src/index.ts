import axios from 'axios'
import { JSDOM } from 'jsdom'
import { getSplits } from './libs/vasaloppet'
import { Language, VasaEvent } from './constants'

const start = async () => {
  const personId = process.argv[2]
  console.log('Looking up', personId)
  const result = await axios.get('https://results.vasaloppet.se/2024/', {
    params: {
      content: 'detail',
      idp: personId,
      lang: Language.English,
      event: VasaEvent.OpenTrack,
      search_event: ''
    }
  })
  const dom = new JSDOM(result.data)
  const splits = getSplits(dom)
  console.log(splits)

}

start()