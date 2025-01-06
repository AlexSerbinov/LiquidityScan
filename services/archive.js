// Import necessary modules and services
const schedule = require("node-schedule")
const { getFetcher } = require("../lib/services/archive/fetchers/fetcher-factory")
const { getLatestRedisBlock, saveUsersToArchive, getArchiveUsers } = require("../lib/services/archive/utils")
const { configurePool } = require("../lib/ethers/pool")
const redis = require("../lib/redis/redis/lib/redis")
const { PROTOCOLS_CONFIG } = require("../lib/constants/index")
const connectionChecker = require("../lib/utils/connections")

/**
 * import events logger constants from loggerTopicsConstants
 */
const { START, STOP, INFO, ERROR_MESSAGE, ARCHIVE_SYNCRONIZATION_FINISHED, USERS_SAVED_TO_ARCHIVE, NEW_BLOCK_RECEIVED, LATEST_STORED_BLOCK, TOTAL_STORED_USERS, ARCHIVE_USERS_GROUP } = require("../configs/loggerTopicsConstants")

/**
 * Extract necessary parameters from $.params
 * @param {string} protocol - The name of the lending protocol (e.g., "V1", "V2", "V3", "Compound")
 * @param {string} configPath - Path to the configuration file Main.json, that contains necessary settings and parameters for the service.
 * @param {string} service - The name of the service (e.g., "subgraph", "dataFetcher", "transmitFetcher", "proxy", "archive", "blacklist", etc.)
 */
const { protocol, service, configPath } = $.params

/**
 * Get the block number at which the protocol was created from the configuration
 * @param {number} CREATED_AT_BLOCK - The block number at which the protocol was created.
 * Used for start scanning from this block. Earlier no sense to scan.
 */
const CREATED_AT_BLOCK = PROTOCOLS_CONFIG[protocol].CREATED_AT_BLOCK

// Load the configuration Main.json file
const config = require(`${process.cwd()}${configPath}`)

/**
 * Prepare Redis connection
 * @param {url} config.REDIS_HOST - Redis host address
 * @param {number} config.REDIS_PORT - Redis port number
 */
await redis.prepare(config.REDIS_HOST, config.REDIS_PORT)

/**
 * Configure the Ethereum connection pool
 */
configurePool([config.RPC_WSS])

/**
 * @param {number} archiveBlockDiff - Time buffer to process block logs efficiently
 */
const archiveBlockDiff = config.ARCHIVE_BLOCKS_DIFF || 10

/**
 * Get latesr block stored in the redis.
 * From this block will continue scanning
 */
let latestArchiveBlock = (await getLatestRedisBlock(protocol)) || CREATED_AT_BLOCK

/**
 * Initialize fetcher instance for the specified protocol
 * Main scanning logic
 */
const fetcher = getFetcher(protocol)

console.log(`${service} started`)
$.send("start", {
  service,
  protocol,
  ev: START,
  data: { message: `${protocol} archive starting at ${new Date().toLocaleString("en-US")}` },
})

/**
 * Check if the eth provider is active
 */
const nodeActive = await connectionChecker.checkNodeConnection()
if (!nodeActive) {
  $.send("errorMessage", {
    service,
    protocol,
    ev: ERROR_MESSAGE,
    data: `archive terminating`,
  })
  setImmediate(() => {
    process.exit(1)
  })
}

/**
 * Listen for new blocks and trigger fetching
 * @param {number} data.number - Latest block number from the provider (fetched by events.js)
 */
$.on("onBlock", data => {
  const { number } = data
  if (!fetcher.inProgress && latestArchiveBlock && number - latestArchiveBlock > archiveBlockDiff) {
    fetcher.start(latestArchiveBlock, number)
    fetcher.emit("info", `Received new block ${number}`, NEW_BLOCK_RECEIVED)
    fetcher.emit("info", `Latest block stored in archive: ${latestArchiveBlock}`, LATEST_STORED_BLOCK)
  }
})

/**
 * Handle events from the fetcher
 */
fetcher.on("fetch", async data => {
  const { users, toBlock } = data
  await saveUsersToArchive(protocol, toBlock, users, "archive_users")
  fetcher.emit("info", `Users saved to archive: ${data.users?.length}, scanned period until block: ${data?.toBlock} | saved users to archive: ${JSON.stringify(users)}`, USERS_SAVED_TO_ARCHIVE)
  const archiveUsers = await getArchiveUsers(protocol)
  fetcher.emit("info", `In archive stored ${archiveUsers.length} users`, TOTAL_STORED_USERS)
})

/**
 * Set global reserves data
 * Without this service not started
 */
$.on(`onReservesData`, data => {
  fetcher.setGlobalReservesData(data)
})

/**
 * Set the last archive block, called when the process of scanning in a particular protocol is finished
 * it called when we run scanning process from scratch. When it finished, it no more used.
 */
fetcher.on("finished", async data => {
  latestArchiveBlock = data.latestBlock
  fetcher.emit("info", `Scanning Finished: Latest Stored Archive Block: ${latestArchiveBlock}`, ARCHIVE_SYNCRONIZATION_FINISHED)
  const users = await getArchiveUsers(protocol)
  fetcher.emit("info", `In archive stored ${users.length} users`, TOTAL_STORED_USERS)
})

/**
 * Log current archive status
 * @param {string} protocol - The name of the lending protocol. E.g., "V1", "V2", "V3", "Compound"
 * @param {Fetcher} fetcher - The fetcher instance
 * @param {number} latestArchiveBlock - The latest block stored in the archive.
 */
const logCurrentArchiveStatus = async (protocol, fetcher, latestArchiveBlock) => {
  const users = await getArchiveUsers(protocol)
  const usersCount = users.length

  fetcher.emit("info", `In archive stored ${usersCount} users`, TOTAL_STORED_USERS)
  fetcher.emit("info", `Latest block stored to archive: ${latestArchiveBlock}`, INFO)
}
/**
 * Log current state
 */
await logCurrentArchiveStatus(protocol, fetcher, latestArchiveBlock)

/**
 * Often, when we miss a liquidation for a user, we need to find out which service missed it.
 * In the archive, each protocol can have 50,000 users.
 * I decided to log all users at the start of the day to easily find them using VSCode in logs.
 * Note: We log 50-200 users per line because VSCode doesn't show very long lines.
 *
 * Log users addresses in groups of a specified number every day at 00:01:00 UTC.
 * @param {string} protocol - The name of the lending protocol. E.g., "V1", "V2", "V3", "Compound".
 * @param {Fetcher} fetcher - The fetcher instance.
 * @param {number} usersPerGroup - The number of users to log per group.
 */
const logUsersAddressesDaily = async (protocol, fetcher, usersPerGroup = 100) => {
  schedule.scheduleJob({ hour: 0, minute: 1, second: 0, tz: "UTC" }, async () => {
    try {
      const users = await getArchiveUsers(protocol)

      fetcher.emit("info", `Total users for protocol ${protocol}: ${users.length}`, TOTAL_STORED_USERS)

      for (let i = 0; i < users.length; i += usersPerGroup) {
        setImmediate(async () => {
          const groupedUsers = users.slice(i, i + usersPerGroup)
          fetcher.emit("info", `Users: ${groupedUsers.join(", ")}`, ARCHIVE_USERS_GROUP)
        })
      }
    } catch (error) {
      fetcher.emit("error", `Error logging all users addresses: ${error.message}`, ERROR_MESSAGE)
    }
  })
}

/**
 * Start logging users addresses daily
 */
await logUsersAddressesDaily(protocol, fetcher, 100)

/**
 * Used for sending logs from other parts of the protocol to the logger server
 * Main logger handler, use this instead of this.emit("info", data) directly
 */
fetcher.on("info", (data, ev = INFO) => {
  $.send("info", {
    service,
    protocol,
    ev,
    data: JSON.stringify(data),
  })
})

/**
 * Handle process exit
 * If you need to perform some cleanup before the process exits, add this functionale here
 */
$.onExit(async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      const { pid } = process
      console.log(pid, "Ready to exit.")
      const date = new Date().toUTCString()
      $.send("stop", {
        service,
        protocol,
        ev: STOP,
        data: date,
      })
      resolve()
    }, 100) // Small timeout to ensure async cleanup completes
  })
})

/**
 * Handle uncaught exceptions that occur in the application.
 *
 * This event listener is triggered when an uncaught exception bubbles up to the event loop.
 * It catches exceptions that are not handled by try-catch blocks or promises.
 */
process.on("uncaughtException", error => {
  $.send("errorMessage", {
    service,
    protocol,
    ev: ERROR_MESSAGE,
    data: error,
  })
})
