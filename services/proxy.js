const EventEmitter = require("node:events")
const redis = require("../lib/redis/redis/lib/redis")
const { getArchiveData } = require("../lib/redis/index")

/**
 * import events logger constants from loggerTopicsConstants
 */
const { ERROR_MESSAGE, START, STOP, INFO, RECEIVED_DRAIN_EVENT, ALL_BATCHES_SENT, TOTAL_STORED_USERS, NON_BLACKLIST_USERS_COUNT } = require("../configs/loggerTopicsConstants")

/**
 * @param {number} batchSize - The number of users to process in each batch. This determines the size of the user groups
 * sent to the subgraph in each operation, affecting the throughput and efficiency of the data processing.
 * This is also the number of users that will be sent to the simulator in one bundle. NOTE: that with a bundle size
 * greater than 30-50 (depend on transaction size), the simulator may produce an error due to exceeding the block's gas limit.
 *
 * @param {string} protocol - The name of the lending protocol (e.g., "V1", "V2", "V3" "Compound")
 *
 * @param {string} configPath - Path to the configuration file that contains necessary settings and parameters for the service.
 * This file includes configurations such as database connections, service endpoints, and other operational parameters.
 *
 * @param {number} SEND_WITHOUT_DRAIN_TIMEOUT - The maximum amount of time (in milliseconds) to wait before forcibly sending a
 * batch of users if no 'drain' event is received. This timeout ensures that data continues to flow, preventing potential
 * deadlocks or stalls in data processing.
 *
 * @param {string} service - The name of the service (e.g., "subgraph", "dataFetcher", "transmitFetcher" "proxy", "archive", "blacklist", etc.)
 *
 */
const { batchSize, protocol, configPath, service, SEND_WITHOUT_DRAIN_TIMEOUT } = $.params
const config = require(`${process.cwd()}${configPath}`)
const fetcher = new EventEmitter()

/**
 * Prepare Redis connection
 * @param {url} config.REDIS_HOST - Redis host address
 * @param {number} config.REDIS_PORT - Redis port number
 */
await redis.prepare(config.REDIS_HOST, config.REDIS_PORT)
const { checkUsersInBlacklistSet } = require("../lib/redis")

console.log(`${service} started`)
fetcher.emit("info", `proxy started. batchSize = ${batchSize}, SEND_WITHOUT_DRAIN_TIMEOUT = ${SEND_WITHOUT_DRAIN_TIMEOUT}`, START)

let isSending = false // Flag to indicate if sending is in progress

/**
 * Handles the 'sendUsersToSubgraph' event by fetching non-blacklisted users
 * and sending them to the subgraph in batches.
 */
fetcher.on("sendUsersToSubgraph", async () => {
  const nonBlacklistedUsers = await getNonBlacklistedUsers(protocol)
  await sendUsersToSubraphInBatches(nonBlacklistedUsers)
})

/**
 * Listener for 'drain' events to manage sending users to the subgraph.
 * It keeps track of the time and count of drain events to ensure timely processing.
 */
let drainEventCount = 0 // Counter for drain events

$.on("drain", data => {
  fetcher.emit("info", `${protocol} Received drain event from subgraph. Flag isSending = ${isSending}`, RECEIVED_DRAIN_EVENT)
  if (isSending) return
  drainEventCount++
  if (drainEventCount === data.forks) {
    fetcher.emit("info", `${protocol} Received all ${drainEventCount}/${data.forks} drain event from subgraph. Flag isSending = ${isSending}`, RECEIVED_DRAIN_EVENT)
    drainEventCount = 0 // Reset the counter after reaching the expected number of drain events

    clearTimeout(drainTimer) // Reset the drain timer because of receiving the drain event
    onDrain()
  }
})

/**
 * Triggered upon receiving a drain event, this function fetches non-blacklisted users
 * and sends them to the subgraph in batches.
 */
const onDrain = async () => {
  isSending = true
  const nonBlacklistedUsers = await getNonBlacklistedUsers(protocol)
  await sendUsersToSubraphInBatches(nonBlacklistedUsers)
  isSending = false
}

/**
 * Retrieves non-blacklisted users for the given protocol.
 * @param {string} protocol - The protocol identifier.
 * @returns {Promise<Array<string>>} An array of non-blacklisted user addresses.
 */
const getNonBlacklistedUsers = async protocol => {
  const allUsers = await getArchiveUsers(protocol)

  const usersToCheck = allUsers.map(userInfo => userInfo.user)
  fetcher.emit("info", `${protocol} all users count: ${usersToCheck.length}`, TOTAL_STORED_USERS)
  const checkBlacklistUsers = await checkUsersInBlacklistSet(usersToCheck, protocol)

  const nonBlacklistedUsers = allUsers.filter((_, index) => checkBlacklistUsers[index] === 0).map(userInfo => userInfo.user.toLowerCase()) // Mapping to get only user addresses and Convert users to lowercase after filtering
  fetcher.emit("info", `${protocol} non blacklisted users count: ${nonBlacklistedUsers.length}`, NON_BLACKLIST_USERS_COUNT)

  return nonBlacklistedUsers
}

/**
 * Fetches users from the archive or subgraph for the given protocol.
 * @param {string} protocol - The protocol identifier.
 * @returns {Promise<Array<string>>} An array of user addresses.
 */
const getArchiveUsers = async protocol => {
  const allUsers = await getArchiveData(protocol, "archive_users")
  // Extract the arrays and flatten them into a single array
  const users = Object.values(allUsers).flat()
  return users
}

/**
 * Sends the non-blacklisted users to the subgraph in batches.
 * @param {Array<string>} nonBlacklistedUsers - An array of non-blacklisted user addresses.
 */
const sendUsersToSubraphInBatches = async nonBlacklistedUsers => {
  isSending = true // Set the sending flag to true at the beginning
  const totalBatches = Math.ceil(nonBlacklistedUsers.length / batchSize)
  let batchesSent = 0

  for (let i = 0; i < nonBlacklistedUsers.length; i += batchSize) {
    // Use setImmediate for asynchronous sending
    setImmediate(async () => {
      const batch = nonBlacklistedUsers.slice(i, i + batchSize)
      const batchNumber = i / batchSize + 1

      $.send("sendUsersToSubgraph", batch)
      // Check if the current batch is the last one
      if (batchNumber === totalBatches) {
        fetcher.emit("info", `Sent all ${batchNumber} batches. Each batch contains ${batchSize} users`, ALL_BATCHES_SENT)
      }

      batchesSent++
      // Check if all batches have been sent
      if (batchesSent === totalBatches) isSending = false // Reset the sending flag after the last iteration
    })
  }
}

/**
 * Sets up a timer to trigger the drain event manually if not received within a specified timeout.
 */
let drainTimer
const setupDrainTimer = () => {
  clearTimeout(drainTimer)

  drainTimer = setTimeout(() => {
    onDrain()
      .then(() => {
        setupDrainTimer() // Reset the timer after successful drain
      })
      .catch(error => {
        fetcher.emit("error", error)
        console.error("Drain failed:", error)
      })
  }, SEND_WITHOUT_DRAIN_TIMEOUT)
}

// Initiate the main functionality immediately upon script start
onDrain()
// Start the drain timer to send batches if first drain event not received
setupDrainTimer()

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
 * Fetcher error event
 */
fetcher.on("error", data => {
  $.send("errorMessage", {
    service,
    protocol,
    ev: ERROR_MESSAGE,
    data,
  })
})

// Handle uncaught exceptions
process.on("uncaughtException", error => {
  console.error(error)
  fetcher.emit("error", error)
  $.send("errorMessage", {
    service,
    protocol,
    ev: ERROR_MESSAGE,
    data: error,
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
