const path = require("path")
const fs = require("fs")

function logSearcherResult({ startTimeString, protocol, updated, deleted, executionTime }) {
  fs.appendFileSync(
    path.join(process.cwd(), "searcher.log"),
    `Started at ${startTimeString.replace(/[^a-zA-Z0-9:/ ]/g, "")} \n` +
      `${protocol} \n` +
      `- Deleted from DB: ${deleted} \n` +
      `- Updated: ${updated} \n` +
      `- Time used: ${executionTime / 1000}s \n\n`
  )
}

function logSubgraphResult({ startTime, protocol, created, updated, executionTime }) {
  fs.appendFileSync(
    path.join(process.cwd(), "subgraph_fetcher.log"),
    `Started at ${startTime.toLocaleString("en-US").replace(/[^a-zA-Z0-9:/ ]/g, "")} \n` +
      `${protocol} \n` +
      `- Added to DB: ${created} \n` +
      `- Updated: ${updated} \n` +
      `- Execution time: ${executionTime / 1000}s \n\n`
  )
}

function logArchiveResult({ startTimeString, from, to, amount, protocol }) {
  fs.appendFileSync(
    path.join(process.cwd(), "archive.log"),
    `Archive: \n` +
      `DATE & TIME ${startTimeString.replace(/[^a-zA-Z0-9:/ ]/g, "")} \n` +
      `Synced from ${from} to ${to} \n` +
      `${protocol} \n` +
      `Archived: ${amount} \n\n`
  )
}

function logArchiveListenerResult({ startTimeString, amount, protocol }) {
  fs.appendFileSync(
    path.join(process.cwd(), "archive.log"),
    `Listener: \n` +
      `DATE & TIME ${startTimeString.replace(/[^a-zA-Z0-9:/ ]/g, "")} \n` +
      `${protocol} \n` +
      `Archived: ${amount} \n\n`
  )
}

const pm2log = obj => {
  const now = new Date().toISOString()
  setImmediate(() => {
    let msg = `** ${now}`
    for (const key in obj) {
      try {
        msg += ` | ${key}: ${obj[key]}`
      } catch (e) {}
    }
    msg += '\n'
    console.log(msg)
  })
}

module.exports = {
  logSearcherResult,
  logSubgraphResult,
  logArchiveResult,
  logArchiveListenerResult,
  pm2log
}
