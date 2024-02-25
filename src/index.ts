import { Split, getPerson, getSplits } from './libs/vasaloppet'
import { VasaEvent } from './constants'

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

const setup = async (pids: string[]): Promise<{
  pids: string[],
  lookup: PersonLookup
}> => {
  let lookup = {}
  for (let pid of pids) {
    const details = await getPerson(pid, VasaEvent.OpenTrack)
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
  opts: LoopOpts
): Promise<NodeJS.Timeout> {
  let { lookup } = await setup(pids)
  const splitHandler = async () => {
    for (let pid of pids) {
      const p = lookup[pid]
      opts?.onUpdate?.(pid, lookup)
      const splits = await getSplits(pid, VasaEvent.OpenTrack)
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
  let updates = 0
  loop(pids, {
    onUpdate: (pid, lookup) => {
      updates += 1
      if (updates > pids.length) process.stdout.write(".");
    },
    onSplit: (pid, lookup, newSplits) => {
      const p = lookup[pid]
      const passedSplits = newSplits.filter((split) => split.prediction === false)
      const splitsLeft = newSplits.length - passedSplits.length
      console.log('')
      if (splitsLeft > 0) {
        console.log(`⭐️ ${p.details.firstname} ${p.details.lastname} passed ${passedSplits.at(-1)?.name} with a predicted time of ${newSplits.at(-1)?.lapTime} (${splitsLeft} splits left)`)
      } else {
        console.log(`✅ ${p.details.firstname} ${p.details.lastname} finished at ${passedSplits.at(-1)?.lapTime}!`)
      }
    },
  })
}

start()