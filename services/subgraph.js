const { getFetcher } = require("../lib/services/subgraph/fetchers/fetcher-factory")
const { Queue } = require("../lib/helpers/queue/lib")
const { configurePool } = require("../lib/ethers/pool")
const { createSimulator } = require("../lib/simulator")

/**
 * import events logger constants from loggerTopicsConstants
 */
const { START, STOP, INFO, ERROR_MESSAGE, SEND_USER_TO_DATA_FETCHER, SEND_DRAIN_EVENT } = require("../configs/loggerTopicsConstants")

/**
 * @param {number} execution_timeout - The time limit for each task's execution within the queue. (ms),
 * If a task exceeds this duration, the queue will attempt to move on to the next task,
 * preventing the system from being stalled by tasks that take too long to complete.
 * Adjusting this value can help manage the balance between responsiveness and allowing adequate time for task completion.
 *
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
 * @param {Function} formattedTrace - A function used in the simulator to format the formattedTrace log. It displays every
 * call between the smart contract, including call, delegate call, etc., providing a complete breakdown of interactions.
 *
 * @param {string} stateOverrides - The bytecode of the smart contract used for simulation. This is utilized
 * to fetch user data using the simulator, effectively representing the bytecode of our smart contract.
 *
 * @param {string} service - The name of the service (e.g., "subgraph", "dataFetcher", "transmitFetcher" "proxy", "archive", "blacklist", etc.)
 *
 * @param {string} enso_url - The url to enso simulator
 */

const { protocol, formattedTrace, stateOverrides, configPath, filters, service, enso_url, execution_timeout } = $.params

/**
 * Number of running instances of the service
 */
const forks = $.forks

/**
 *  Load the configuration from Main.json
 */
const config = require(`${process.cwd()}${configPath}`)

/**
 * Initiating the connection to the Ethereum node
 */
configurePool([config.RPC_WSS])

/**
 * Interface for enso simulator
 */
const simulator = createSimulator(enso_url, formattedTrace, stateOverrides)

/**
 * Create fetcher and queue
 * Proccess all users and then drain queues inbetween proxy<>subgraph
 */

const fetcher = getFetcher($.params, filters, config, simulator)
const queue = new Queue(async users => await fetcher.fetchSubgraphUsers(users), execution_timeout)

console.log("subgraph started")
$.send("start", {
  service,
  protocol,
  ev: START,
  data: `${protocol} subgraph started`,
})

queue.on("drain", async () => {
  $.send("drain", { forks })
  const date = new Date().toUTCString()
  $.send("info", {
    service,
    protocol,
    ev: SEND_DRAIN_EVENT,
    data: `send drain event ${date}`,
  })
})

queue.on("errorMessage", (error, ev = ERROR_MESSAGE) => {
  fetcher.emit("errorMessage", error, ev)
})

/**
 * Output point
 */
fetcher.on("fetch", data => {
  $.send("sendToDataFetcher", data)
  fetcher.emit("info", data, SEND_USER_TO_DATA_FETCHER)
})

/**
 * Used for sending logs from other parths of protocol
 */
fetcher.on("info", (data, ev = INFO) => {
  $.send("info", {
    service,
    protocol,
    ev,
    data: JSON.stringify(data),
  })
})

fetcher.on("errorMessage", (error, ev = ERROR_MESSAGE) => {
  if (error && error.message) {
    const errorData = { message: error.message }

    $.send("errorMessage", {
      service,
      protocol,
      ev,
      error: JSON.stringify(errorData),
    })
  }
})

/**
 * Listeners
 */
$.on(`onReservesData`, data => {
  fetcher.setGlobalReservesData(data)
})

/**
 * Input point from Subgraph service
 * Add arrays of users to the queue for processing.
 * Because, in the simulator, we send a batch of users by time.
 * Not all users together
 * @param {Array} users - Array of users
 */
$.on("handleUser", async users => {
  queue.add(users)
})

/**
 * Handle uncaught exceptions
 */
process.on("uncaughtException", (error, ev) => {
  $.send("errorMessage", {
    service,
    protocol,
    ev,
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
