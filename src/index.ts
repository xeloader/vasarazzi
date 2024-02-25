import 'dotenv/config'

import { Split, getPerson, getSplits } from './libs/vasaloppet'
import { VasaEvent } from './constants'
import { sendNotification } from './libs/pushover'

interface Person {
  firstname: string,
  lastname: string
}

type PersonLookup = {
  [key: string]: { // pid
    updatedAt?: string, // timestamp
    details: Person,
    splits: Split[]
  }
}

function parseArgs(args: string): string[] {
  return args.split(',')
    .map((arg) => arg.trim())
}

const setup = async (pids: string[], event: VasaEvent): Promise<{
  pids: string[],
  lookup: PersonLookup
}> => {
  let lookup = {}
  for (let pid of pids) {
    const details = await getPerson(pid, event)
    lookup[pid] = {
      updatedAt: undefined,
      details,
      splits: []
    }
  }
  return {
    pids,
    lookup
  }
}

interface LoopOpts {
  onSplit: (
    pid: string, 
    lookup: PersonLookup, 
    newSplits: Split[]
  ) => void
  onUpdate: (
    pid: string,
    lookup: PersonLookup
  ) => void
}

async function loop (
  pids: string[], 
  event: VasaEvent,
  opts: LoopOpts
): Promise<NodeJS.Timeout> {
  let { lookup } = await setup(pids, event)
  const splitHandler = async () => {
    for (let pid of pids) {
      const p = lookup[pid]
      opts?.onUpdate?.(pid, lookup)
      const splits = await getSplits(pid, event)
      const passedSplits = splits.filter((split) => split.prediction === false)
      const prevPassedSplits = p.splits.filter((split) => split.prediction === false)
      if (passedSplits.length > prevPassedSplits.length) {
        opts?.onSplit?.(pid, lookup, splits)
      }
      p.updatedAt = new Date().toISOString()
      p.splits = splits
    }
  }
  await splitHandler()
  return setInterval(splitHandler, 10000)
}

const start = async () => {
  const pids = parseArgs(process.argv[2])

  const pushoverEnabled = !!(process.env.PUSHOVER_USER_TOKEN && process.env.PUSHOVER_APP_TOKEN)
  if (pushoverEnabled) {
    console.log('⚙️  Pushover is enabled')
  }

  let updates = 0
  let notifications = 0
  loop(pids, VasaEvent.OpenTrackSunday24, {
    onUpdate: () => {
      updates += 1
      if (updates > pids.length) process.stdout.write(".");
    },
    onSplit: (pid, lookup, newSplits) => {
      const p = lookup[pid]
      const passedSplits = newSplits.filter((split) => split.prediction === false)
      const splitsLeft = newSplits.length - passedSplits.length
      const nextSplit = newSplits?.[passedSplits.length]

      let message = ''
      if (splitsLeft > 0) {
        message = `⭐️ ${p.details.firstname} ${p.details.lastname} passed ${passedSplits.at(-1)?.name} at ${passedSplits.at(-1)?.timestamp} with a predicted time of ${newSplits.at(-1)?.lapTime} (${splitsLeft} splits left, next: ${nextSplit?.name?.slice?.(0,-2)})`
      } else {
        message = `✅ ${p.details.firstname} ${p.details.lastname} finished at ${passedSplits.at(-1)?.timestamp} with a time of ${passedSplits.at(-1)?.lapTime}!`
      }
      console.log('')
      console.log(message)

      if (pushoverEnabled) {
        notifications += 1
        if (notifications > pids.length) {
          sendNotification(message, {
            appToken: process.env.PUSHOVER_APP_TOKEN,
            userToken: process.env.PUSHOVER_USER_TOKEN
          })
        }
      }
    },
  })
}

start()