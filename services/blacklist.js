const { configurePool } = require("../lib/ethers/pool")
const redis = require("../lib/redis/redis/lib/redis")
const { createConcurrency } = require("../lib/helpers/queue/lib")
const { createSimulator } = require("../lib/simulator")

const { getFetcher } = require("../lib/services/blacklist/fetchers/fetcher-factory")

const { START, STOP, INFO, ERROR_MESSAGE, BLACKLIST_FILTERING_LOOP_DONE, ADD_USER_TO_BLACKLIST, REMOVE_USER_FROM_BLACKLIST } = require("../configs/loggerTopicsConstants")
/**
 * @param {*} filters - The filters object containing the following properties:
 *  - mode: The mode of operation (e.g. "fetch")
 *  - min_collateral_amount: The minimum collateral amount
 *  - min_borrow_amount: The minimum borrow amount
 *  - min_health_factor: The minimum health factor
 *  - max_health_factor: The maximum health factor
 *  - update_time: The update time in seconds
 *
 * @param {string} protocol - The name of the lending protocol (e.g., "V1", "V2", "V3" "Compound")
 *
 * @param {string} configPath - Path to the configuration file Main.json, that contains necessary filters and parameters for the service.
 * This file includes configurations such as database connections, service endpoints, and other operational parameters.
 *
 * @param {string} service - The name of the service (e.g., "subgraph", "dataFetcher", "transmitFetcher" "proxy", "archive", "blacklist", etc.)
 *
 * @param {number} concurrency - This parameter determines the number of parallel executions of the filtering functions.
 * It affects the speed at which all users in the blacklist are filtered. However, the speed of the blacklist is not
 * critical for our purposes.
 * Note: It is safe to set high values for this parameter (can be useful for debugging).
 * The system will still function properly, but it will consume more resources especially of the provider.
 * Therefore, values between 2 and 5 are generally acceptable.
 *
 * @param {number} execution_timeout - The time limit for each task's execution within the queue. (ms),
 * If a task exceeds this duration, the queue will attempt to move on to the next task,
 * preventing the system from being stalled by tasks that take too long to complete.
 * Adjusting this value can help manage the balance between responsiveness and allowing adequate time for task completion.
 *
 * @param {Function} formattedTrace - A function used in the simulator to format the formattedTrace log. It displays every
 * call between the smart contract, including call, delegate call, etc., providing a complete breakdown of interactions.
 *
 * @param {string} stateOverrides - The bytecode of the smart contract used for simulation. This is utilized
 * to fetch user data using the simulator, effectively representing the bytecode of our smart contract.
 *
 * @param {string} enso_url - The url to enso simulator
 *
 * @Note @param {number} delayBetweenRequestsToSimulator - Important parameter for controlling the rate of requests sent to the simulator when updating the blacklist.
 * By setting a delay between requests, we prevent overloading the simulator. Without this parameter, blacklist will use all aveiliable power of the simulator
 * Since frequent updates to the blacklist are unnecessary, incorporating a pause between requests helps maintain the simulator's performance.
 * Although it would be more intuitive to include this parameter in the queue.js file, the decision was made to avoid modifying the existing queue.js mechanism.
 * This parameter is utilized in the file lib/services/blacklist/fetchers/fetcher.js to regulate the timing of requests to the simulator.
 */

const { protocol, configPath, filters, service, concurrency, execution_timeout, formattedTrace, stateOverrides, enso_url } = $.params

/**
 * Load the configuration Main.json file
 */
const config = require(`${process.cwd()}${configPath}`)

/**
 * Initiating the connection to the Ethereum node
 */
configurePool([config.RPC_WSS])

/**
 * Prepare Redis connection
 * @param {url} config.REDIS_HOST - Redis host address
 * @param {number} config.REDIS_PORT - Redis port number
 */
await redis.prepare(config.REDIS_HOST, config.REDIS_PORT)
const { addUsersToBlacklistSet, removeUsersFromBlacklistSet } = require("../lib/redis")
const { getArchiveUsersAndStartScanning } = require("../lib/services/blacklist/utils")

/**
 * Interface for enso simulator
 */
const simulator = createSimulator(enso_url, formattedTrace, stateOverrides)

/**
 * Create queue and fetcher. Main filtering logic
 */
let allQueuesFull = new Array(concurrency).fill(true)
const fetcher = getFetcher(protocol, $.params, filters, config, simulator)
const queue = createConcurrency(concurrency, async user => fetcher.fetchUser(user), execution_timeout)

/**
 * When all queues are empty, start processing again.
 */
queue.on("drain", async q => {
  allQueuesFull[q.queue] = false
  if (allQueuesFull.every(value => value === false)) {
    $.send("info", {
      service,
      protocol,
      ev: BLACKLIST_FILTERING_LOOP_DONE,
      data: `All users for protocol ${protocol} were filtered and some added to blacklist`,
    })
    allQueuesFull = new Array(concurrency).fill(true)
    getArchiveUsersAndStartScanning(protocol, queue, $.params)
  }
})

/**
 * Notify that service is started
 */
$.send("start", {
  service,
  protocol,
  ev: START,
  data: `${service} ${protocol} started using ${$.params?.useSimulatorInsteadOfNode ? "simulator" : "node"}. Concurency number: ${concurrency}, date: ${new Date().toUTCString()}`,
})
console.log(`${service} ${protocol} started using ${$.params?.useSimulatorInsteadOfNode ? "simulator" : "node"}`)

/**
 * Fetcher events. Update user in redis
 */
fetcher.on("fetch", async data => {
  const { user, add } = data

  if (add) {
    fetcher.emit("info", JSON.stringify(data), ADD_USER_TO_BLACKLIST)
    addUsersToBlacklistSet([user], protocol)
  } else {
    fetcher.emit("info", JSON.stringify(data), REMOVE_USER_FROM_BLACKLIST)
    removeUsersFromBlacklistSet([user], protocol)
  }
})

/**
 * We start processing only after receiveng globalReserves on listener $.on(`onReservesData`)
 */
fetcher.once("fetcherReady", () => {
  getArchiveUsersAndStartScanning(protocol, queue, $.params)
})

/**
 * init fetcher
 */
fetcher.init()

/**
 * MQTT Listeners
 */
$.on(`onReservesData`, data => {
  fetcher.setGlobalReservesData(data)
})

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

/**
 * Handle process exit
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

// Handle uncaught exceptions
process.on("uncaughtException", error => {
  console.error(error)
  $.send("errorMessage", {
    service,
    protocol,
    ev: ERROR_MESSAGE,
    data: error,
  })
})
