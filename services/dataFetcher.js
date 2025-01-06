const { createFetcher } = require("../lib/services/data-fetcher/fetchers/fetcher-factory")
const { configurePool } = require("../lib/ethers/pool")
const redis = require("../lib/redis/redis/lib/redis")
const { createSimulator } = require("../lib/simulator")
const { addUsersToDataFetcherSet, removeUsersFromDataFetcherSet } = require("../lib/redis")

/**
 * import events logger constants from loggerTopicsConstants
 */
const { START, STOP, INFO, LIQUIDATE_EVENT, ERROR_MESSAGE, RECIEVED_INPUT_ADDRESS } = require("../configs/loggerTopicsConstants")

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
 * @param {Function} formattedTrace - A function used in the simulator to format the formattedTrace log. It displays every
 * call between the smart contract, including call, delegate call, etc., providing a complete breakdown of interactions.
 *
 * @param {string} stateOverrides - The bytecode of the smart contract used for simulation. This is utilized
 * to fetch user data using the simulator, effectively representing the bytecode of our smart contract.
 *
 * @param {string} enso_url - The url to enso simulator
 */

const { protocol, configPath, filters, service, formattedTrace, stateOverrides, enso_url } = $.params

// Load the configuration Main.json file
const config = require(`${process.cwd()}${configPath}`)

/**
 * Prepare Redis connection
 * @param {url} config.REDIS_HOST - Redis host address
 * @param {number} config.REDIS_PORT - Redis port number
 */
await redis.prepare(config.REDIS_HOST, config.REDIS_PORT)

/**
 * Initiating the connection to the Ethereum node
 */
configurePool([config.RPC_WSS])

/**
 * Interface for enso simulator
 */
const simulator = createSimulator(enso_url, formattedTrace, stateOverrides)

/**
 * Create fetcher. Main filtering logic
 */
const fetcher = createFetcher(protocol, filters, config, $.params, simulator)

console.log(`${service} started ${protocol} using ${$.params?.useSimulatorInsteadOfNode ? "simulator" : "node"}`)

$.send("start", {
  service,
  protocol,
  ev: START,
  data: `${service} started ${protocol} using ${$.params?.useSimulatorInsteadOfNode ? "simulator" : "node"}`,
})

/**
 * Users for long-time watching
 */
fetcher.on("pushToRedis", data => {
  const { user, assets } = data
  for (let index = 0; index < assets.length; index++) {
    addUsersToDataFetcherSet([user], protocol, assets[index])
  }
})
/**
 * When user deletes
 * Delete even if there is no uses - prevent double checking and time consuption
 */
fetcher.on("deleteFromRedis", data => {
  const { user, assets } = data
  for (let index = 0; index < assets.length; index++) {
    removeUsersFromDataFetcherSet([user], protocol, assets[index])
  }
  $.send("deleteFromRedis", {
    service,
    protocol,
    ev: "deleteFromRedis",
    data,
  })
})

/**
 * Main output point.
 * Send liquidate event to the Liquidator service
 * And log to the logger server
 */
fetcher.on("liquidate", data => {
  $.send("liquidateCommand", data)
  fetcher.emit("info", data, LIQUIDATE_EVENT)
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
    data,
  })
})

/**
 * Used for sending logs from other parts of the protocol to the logger server
 * Main logger handler, use this instead of this.emit("errorMessage", data) directly
 */
fetcher.on("errorMessage", data => {
  $.send("errorMessage", {
    service,
    protocol,
    ev: ERROR_MESSAGE,
    data: JSON.stringify(data),
  })
})

/**
 * Listeners
 */

/**
 * Set grobal reserves data
 */
$.on(`onReservesData`, data => {
  fetcher.setGlobalReservesData(data)
})

/**
 * Main entry point. Listen user's adddresess
 */
$.on("processUser", async data => {
  $.send("info", {
    service,
    protocol,
    ev: RECIEVED_INPUT_ADDRESS,
    data: JSON.stringify(data),
  })
  fetcher.fetchData(data)
})

/**
 * Handle process exit
 */
$.onExit(async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      const { pid } = process
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
  $.send("errorMessage", {
    service,
    protocol,
    ev: ERROR_MESSAGE,
    data: error,
  })
})
